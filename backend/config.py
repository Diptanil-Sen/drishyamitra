import os
from dotenv import load_dotenv
from cryptography.fernet import Fernet

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))


class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_secret')

    # Database
    DATABASE_URL = os.getenv('DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL if DATABASE_URL else 'sqlite:///drishyamitra.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'fallback_jwt')

    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'data', 'photos')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    # Groq
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')

    # Gmail
    GMAIL_USER = os.getenv('GMAIL_USER')
    GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')

    # Twilio WhatsApp
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER')


    # Encryption — outside class so functions can access it
def encrypt_path(path):
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        return path
    f = Fernet(key.encode())
    return f.encrypt(path.encode()).decode()


def decrypt_path(encrypted_path):
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        return encrypted_path
    try:
        f = Fernet(key.encode())
        return f.decrypt(encrypted_path.encode()).decode()
    except Exception:
        return encrypted_path