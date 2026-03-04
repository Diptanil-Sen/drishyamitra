import os
import requests
from models import db, Photo, DeliveryHistory


def send_photos_via_whatsapp(phone, photo_ids, user_id):
    """
    Sends photos via WhatsApp using whatsapp-web.js service.
    """
    try:
        # Get photos from database
        photos = Photo.query.filter(
            Photo.id.in_(photo_ids),
            Photo.user_id == user_id
        ).all()

        if not photos:
            return {'message': 'No photos found', 'status': 'error'}

        # Format phone number
        if not phone.startswith('+'):
            phone = '+' + phone

        # Send each photo to whatsapp-web.js service
        sent_count = 0
        for photo in photos:
            if os.path.exists(photo.filepath):
                response = requests.post(
                    'http://localhost:3001/send-photo',
                    json={
                        'phone': phone,
                        'photoPath': photo.filepath,
                        'caption': f'Photo from Drishyamitra 📸'
                    }
                )
                if response.status_code == 200:
                    sent_count += 1

                    # Save delivery history
                    history = DeliveryHistory(
                        photo_id=photo.id,
                        delivery_type='whatsapp',
                        recipient=phone,
                        status='sent'
                    )
                    db.session.add(history)

        db.session.commit()

        return {
            'message': f'Successfully sent {sent_count} photo(s) via WhatsApp!',
            'status': 'success'
        }

    except Exception as e:
        print(f"WhatsApp error: {e}")
        return {
            'message': f'Failed to send WhatsApp: {str(e)}',
            'status': 'error'
        }