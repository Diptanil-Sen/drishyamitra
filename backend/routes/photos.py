from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Photo, Face, Person
from werkzeug.utils import secure_filename
import os
import uuid

photos_bp = Blueprint('photos', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# UPLOAD PHOTO
@photos_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_photo():
    user_id = get_jwt_identity()

    if 'photo' not in request.files:
        return jsonify({'message': 'No photo provided'}), 400

    file = request.files['photo']

    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'message': 'File type not allowed'}), 400

    # Create unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"

    # Save file
    from flask import current_app
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, unique_filename)
    file.save(filepath)

    # Save to database
    new_photo = Photo(
        filename=unique_filename,
        filepath=filepath,
        user_id=user_id
    )
    db.session.add(new_photo)
    db.session.commit()

    return jsonify({
        'message': 'Photo uploaded successfully!',
        'photo_id': new_photo.id,
        'filename': unique_filename
    }), 201


# GET ALL PHOTOS for current user
@photos_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_photos():
    user_id = get_jwt_identity()
    photos = Photo.query.filter_by(user_id=user_id).all()

    result = []
    for photo in photos:
        result.append({
            'id': photo.id,
            'filename': photo.filename,
            'uploaded_at': photo.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({'photos': result}), 200


# GET PHOTOS by person name
@photos_bp.route('/by-person/<int:person_id>', methods=['GET'])
@jwt_required()
def get_photos_by_person(person_id):
    faces = Face.query.filter_by(person_id=person_id).all()
    photo_ids = [face.photo_id for face in faces]
    photos = Photo.query.filter(Photo.id.in_(photo_ids)).all()

    result = []
    for photo in photos:
        result.append({
            'id': photo.id,
            'filename': photo.filename,
            'uploaded_at': photo.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({'photos': result}), 200


# DELETE PHOTO
@photos_bp.route('/delete/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_photo(photo_id):
    user_id = get_jwt_identity()
    photo = Photo.query.filter_by(id=photo_id, user_id=user_id).first()

    if not photo:
        return jsonify({'message': 'Photo not found'}), 404

    # Delete associated faces from database
    Face.query.filter_by(photo_id=photo.id).delete()

    # Delete file from disk
    if os.path.exists(photo.filepath):
        os.remove(photo.filepath)

    db.session.delete(photo)
    db.session.commit()

    return jsonify({'message': 'Photo deleted successfully!'}), 200

# SERVE PHOTO FILE
@photos_bp.route('/serve/<filename>', methods=['GET'])
def serve_photo(filename):
    from flask import send_from_directory, current_app
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

# SEARCH PHOTOS by date or person name
@photos_bp.route('/search', methods=['GET'])
@jwt_required()
def search_photos():
    user_id = get_jwt_identity()
    query = request.args.get('q', '').strip()
    date_filter = request.args.get('date', '').strip()

    photos = Photo.query.filter_by(user_id=user_id)

    # Filter by date (format: YYYY-MM-DD)
    if date_filter:
        from datetime import datetime
        try:
            filter_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            photos = photos.filter(
                db.func.date(Photo.uploaded_at) == filter_date
            )
        except ValueError:
            pass

    photos = photos.order_by(Photo.uploaded_at.desc()).all()

    # If searching by person name, filter further
    result = []
    for photo in photos:
        if query:
            faces = Face.query.filter_by(photo_id=photo.id).all()
            person_ids = [f.person_id for f in faces if f.person_id]
            people = Person.query.filter(
                Person.id.in_(person_ids),
                Person.name.ilike(f'%{query}%')
            ).all()
            if not people:
                continue
        result.append({
            'id': photo.id,
            'filename': photo.filename,
            'uploaded_at': photo.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({'photos': result, 'count': len(result)}), 200