from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

auth_bp = Blueprint('auth', __name__)

# SIGNUP
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Check if all fields are provided
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'All fields are required'}), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 400

    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 201


# LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    # Find user
    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    # Create token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful!',
        'token': access_token,
        'username': user.username,
        'user_id': user.id
    }), 200


# GET current user info
@auth_bp.route('/me', methods=['GET'])
def me():
    from flask_jwt_extended import jwt_required, get_jwt_identity
    @jwt_required()
    def protected():
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200
    return protected()