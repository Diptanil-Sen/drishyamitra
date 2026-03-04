from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Face, Person, Photo
import os

faces_bp = Blueprint('faces', __name__)


@faces_bp.route('/people', methods=['GET'])
@jwt_required()
def get_people():
    user_id = get_jwt_identity()
    people = Person.query.filter_by(user_id=user_id).all()

    result = []
    for person in people:
        faces = Face.query.filter_by(person_id=person.id).all()
        unique_photos = len(set([f.photo_id for f in faces]))
        result.append({
            'id': person.id,
            'name': person.name,
            'photo_count': unique_photos,
            'created_at': person.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({'people': result}), 200


# ADD NEW PERSON
@faces_bp.route('/people/add', methods=['POST'])
@jwt_required()
def add_person():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('name'):
        return jsonify({'message': 'Name is required'}), 400

    # Check if person already exists
    existing = Person.query.filter_by(name=data['name'], user_id=user_id).first()
    if existing:
        return jsonify({'message': 'Person already exists'}), 400

    new_person = Person(name=data['name'], user_id=user_id)
    db.session.add(new_person)
    db.session.commit()

    return jsonify({
        'message': f"{data['name']} added successfully!",
        'person_id': new_person.id
    }), 201


# LABEL A FACE (assign a person to a detected face)
@faces_bp.route('/label', methods=['POST'])
@jwt_required()
def label_face():
    data = request.get_json()

    if not data.get('face_id') or not data.get('person_id'):
        return jsonify({'message': 'face_id and person_id are required'}), 400

    face = Face.query.get(data['face_id'])
    if not face:
        return jsonify({'message': 'Face not found'}), 404

    face.person_id = data['person_id']
    db.session.commit()

    return jsonify({'message': 'Face labeled successfully!'}), 200


# DETECT FACES in a photo
@faces_bp.route('/detect/<int:photo_id>', methods=['POST'])
@jwt_required()
def detect_faces(photo_id):
    user_id = get_jwt_identity()

    photo = Photo.query.filter_by(id=photo_id, user_id=user_id).first()
    if not photo:
        return jsonify({'message': 'Photo not found'}), 404

    # Run DeepFace detection with auto-recognition
    from services.deepface_service import detect_and_save_faces
    faces = detect_and_save_faces(photo.filepath, photo.id, user_id)

    # Count auto recognized vs unknown
    auto_recognized = [f for f in faces if f['auto_recognized']]
    unknown = [f for f in faces if not f['auto_recognized']]

    return jsonify({
        'message': f'{len(faces)} face(s) detected! {len(auto_recognized)} auto-recognized, {len(unknown)} unknown.',
        'faces': faces,
        'auto_recognized_count': len(auto_recognized),
        'unknown_count': len(unknown)
    }), 200


# GET ALL FACES in a photo
@faces_bp.route('/in-photo/<int:photo_id>', methods=['GET'])
@jwt_required()
def get_faces_in_photo(photo_id):
    faces = Face.query.filter_by(photo_id=photo_id).all()

    result = []
    for face in faces:
        person_name = None
        if face.person_id:
            person = Person.query.get(face.person_id)
            person_name = person.name if person else None
        result.append({
            'id': face.id,
            'face_path': face.face_path,
            'person_id': face.person_id,
            'person_name': person_name
        })

    return jsonify({'faces': result}), 200

    # GET ALL UNLABELED FACES for current user
@faces_bp.route('/unlabeled', methods=['GET'])
@jwt_required()
def get_unlabeled_faces():
    user_id = get_jwt_identity()

    # Get all photos for this user
    user_photos = Photo.query.filter_by(user_id=user_id).all()
    photo_ids = [p.id for p in user_photos]

    # Get all unlabeled faces in those photos
    unlabeled = Face.query.filter(
        Face.photo_id.in_(photo_ids),
        Face.person_id == None
    ).all()

    result = []
    for face in unlabeled:
        result.append({
            'face_id': face.id,
            'photo_id': face.photo_id,
            'face_filename': os.path.basename(face.face_path)
        })

    return jsonify({
        'unlabeled_faces': result,
        'count': len(result)
    }), 200

# SERVE FACE IMAGE
@faces_bp.route('/serve/<filename>', methods=['GET'])
def serve_face(filename):
    from flask import send_from_directory
    from config import decrypt_path
    faces_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'faces')
    return send_from_directory(faces_dir, filename)