import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from models import db, Photo, DeliveryHistory


def send_photos_via_email(recipient, photo_ids, user_id):
    """
    Sends photos to recipient via Gmail.
    """
    try:
        # Get Gmail credentials from .env
        gmail_user = os.getenv('GMAIL_USER')
        gmail_password = os.getenv('GMAIL_APP_PASSWORD')

        if not gmail_user or not gmail_password:
            return {'message': 'Gmail credentials not configured', 'status': 'error'}

        # Get photos from database
        photos = Photo.query.filter(
            Photo.id.in_(photo_ids),
            Photo.user_id == user_id
        ).all()

        if not photos:
            return {'message': 'No photos found', 'status': 'error'}

        # Create email
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = recipient
        msg['Subject'] = f'Drishyamitra - Your Photos ({len(photos)} photos)'

        # Email body
        body = f"""
Hello!

Please find attached {len(photos)} photo(s) sent via Drishyamitra AI Photo Manager.

Sent with ❤️ by Drishyamitra
        """
        msg.attach(MIMEText(body, 'plain'))

        # Attach each photo
        attached_count = 0
        for photo in photos:
            if os.path.exists(photo.filepath):
                with open(photo.filepath, 'rb') as f:
                    img_data = f.read()
                image = MIMEImage(img_data, name=photo.filename)
                msg.attach(image)
                attached_count += 1

        if attached_count == 0:
            return {'message': 'Photo files not found on disk', 'status': 'error'}

        # Send email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(gmail_user, gmail_password)
            server.send_message(msg)

        # Save delivery history
        for photo in photos:
            history = DeliveryHistory(
                photo_id=photo.id,
                delivery_type='email',
                recipient=recipient,
                status='sent'
            )
            db.session.add(history)
        db.session.commit()

        return {
            'message': f'Successfully sent {attached_count} photo(s) to {recipient}!',
            'status': 'success'
        }

    except smtplib.SMTPAuthenticationError:
        return {'message': 'Gmail authentication failed. Check your app password.', 'status': 'error'}

    except Exception as e:
        print(f"Email error: {e}")
        return {'message': f'Failed to send email: {str(e)}', 'status': 'error'}