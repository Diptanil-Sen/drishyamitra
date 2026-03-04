from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Photo, Person, Face, DeliveryHistory
import os

chatbot_bp = Blueprint('chatbot', __name__)


# MAIN CHAT ENDPOINT
@chatbot_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('message'):
        return jsonify({'message': 'No message provided'}), 400

    user_message = data['message']

    # Send message to Groq AI
    from services.groq_service import get_ai_response
    ai_response = get_ai_response(user_message, user_id)

    return jsonify({
        'response': ai_response
    }), 200


# GET CHAT HISTORY
@chatbot_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()

    deliveries = DeliveryHistory.query.join(Photo).filter(
        Photo.user_id == user_id
    ).order_by(DeliveryHistory.sent_at.desc()).limit(20).all()

    result = []
    for delivery in deliveries:
        result.append({
            'id': delivery.id,
            'delivery_type': delivery.delivery_type,
            'recipient': delivery.recipient,
            'status': delivery.status,
            'sent_at': delivery.sent_at.strftime('%Y-%m-%d %H:%M:%S')
        })

    return jsonify({'history': result}), 200


# SEND PHOTOS VIA EMAIL
@chatbot_bp.route('/send-email', methods=['POST'])
@jwt_required()
def send_email():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('recipient') or not data.get('photo_ids'):
        return jsonify({'message': 'Recipient and photo_ids are required'}), 400

    from services.gmail_service import send_photos_via_email
    result = send_photos_via_email(
        recipient=data['recipient'],
        photo_ids=data['photo_ids'],
        user_id=user_id
    )

    return jsonify(result), 200


# SEND PHOTOS VIA WHATSAPP
@chatbot_bp.route('/send-whatsapp', methods=['POST'])
@jwt_required()
def send_whatsapp():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('phone') or not data.get('photo_ids'):
        return jsonify({'message': 'Phone number and photo_ids are required'}), 400

    from services.whatsapp_service import send_photos_via_whatsapp
    result = send_photos_via_whatsapp(
        phone=data['phone'],
        photo_ids=data['photo_ids'],
        user_id=user_id
    )

    return jsonify(result), 200