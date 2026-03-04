from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models import db
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
from config import Config
database_url = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url if database_url else 'sqlite:///drishyamitra.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Upload folder configuration
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'data', 'photos')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Import and register routes
from routes.auth import auth_bp
from routes.photos import photos_bp
from routes.faces import faces_bp
from routes.chatbot import chatbot_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(photos_bp, url_prefix='/api/photos')
app.register_blueprint(faces_bp, url_prefix='/api/faces')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

# Create all database tables
with app.app_context():
    db.create_all()
    print("✅ Database tables created successfully!")

if __name__ == '__main__':
    app.run(debug=True, port=5000)