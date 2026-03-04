# 🔮 Drishyamitra — AI-Powered Photo Management System

Drishyamitra is an intelligent photo management system that uses deep learning-based facial recognition and natural language understanding to automate photo organization, search, and delivery.

---

## 🚀 Features

- **AI Face Detection** — Automatically detects faces in photos using RetinaFace and MTCNN
- **Face Recognition** — Recognizes known people using Facenet512 model via DeepFace
- **Smart Organization** — Auto-organizes photos into person-specific folders
- **Unknown Face Labeling** — Flags unknown faces for manual labeling
- **AI Chatbot** — Natural language interface powered by Groq LLM
- **Email Delivery** — Send photos directly via Gmail
- **WhatsApp Delivery** — Send photos via WhatsApp using whatsapp-web.js
- **Search** — Search photos by person name or date
- **Delivery History** — Track all email and WhatsApp deliveries
- **Encrypted Storage** — Face data paths are encrypted using Fernet encryption
- **PostgreSQL Support** — Supports both SQLite and PostgreSQL databases
- **JWT Authentication** — Secure token-based user authentication

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, TailwindCSS, Axios |
| Backend | Flask, Flask-SQLAlchemy, Flask-JWT-Extended |
| Database | SQLite (default) / PostgreSQL |
| AI - Face Detection | DeepFace (RetinaFace, MTCNN) |
| AI - Face Recognition | DeepFace (Facenet512) |
| AI - Chatbot | Groq API (llama-3.3-70b) |
| Email | Gmail SMTP |
| WhatsApp | whatsapp-web.js |
| Security | JWT tokens, Fernet encryption |

---

## 📁 Project Structure
```
drishyamitra/
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── config.py               # Configuration & encryption
│   ├── models.py               # Database models
│   ├── routes/
│   │   ├── auth.py             # Authentication routes
│   │   ├── photos.py           # Photo management routes
│   │   ├── faces.py            # Face detection routes
│   │   └── chatbot.py          # Chatbot & delivery routes
│   ├── services/
│   │   ├── deepface_service.py # AI face detection & recognition
│   │   ├── groq_service.py     # Groq LLM chatbot
│   │   ├── gmail_service.py    # Email delivery
│   │   └── whatsapp_service.py # WhatsApp delivery
│   └── data/
│       ├── photos/             # Uploaded photos
│       ├── faces/              # Cropped face images
│       └── delivery_photos/    # Photos ready for delivery
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Upload.jsx
│       │   ├── Chat.jsx
│       │   ├── Person.jsx
│       │   ├── LabelFaces.jsx
│       │   └── History.jsx
│       └── api.js
│
└── whatsapp-service/
    └── index.js                # WhatsApp web service
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 20+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/drishyamitra.git
cd drishyamitra
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure environment variables
Create a `.env` file in the `backend/` folder:
```
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
ENCRYPTION_KEY=your_fernet_key
DATABASE_URL=                        # Leave empty for SQLite, or add PostgreSQL URL
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. WhatsApp Service Setup
```bash
cd whatsapp-service
npm install
```

---

## ▶️ Running the Application

Open **3 terminals** and run one command in each:

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
python3 app.py
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 — WhatsApp Service:**
```bash
cd whatsapp-service
node index.js
```

Then open **http://localhost:3000** in your browser.

---

## 🗄️ Database Models

| Table | Description |
|-------|-------------|
| users | Stores user accounts and credentials |
| photos | Stores uploaded photo metadata |
| people | Stores labeled person names |
| faces | Stores detected face data (encrypted paths) |
| delivery_photo_history | Tracks all email and WhatsApp deliveries |

---

## 🤖 AI Models Used

| Model | Purpose |
|-------|---------|
| RetinaFace | Primary face detection on uploaded photos |
| MTCNN | Secondary face detection and verification |
| Facenet512 | Face recognition and matching |
| Groq llama-3.3-70b | Natural language chatbot |

---

## 💬 Chatbot Commands

| Command | Action |
|---------|--------|
| "Show me photos of Mom" | Finds all photos of Mom |
| "Send Bro's photos to email@gmail.com" | Emails photos |
| "Send photos of Dad to +91XXXXXXXXXX" | WhatsApp delivery |
| "How many photos do I have?" | Library stats |

---

## 🔐 Security Features

- JWT token-based authentication (24hr expiry)
- Password hashing using Werkzeug
- Face data paths encrypted using Fernet symmetric encryption
- Environment variables for all sensitive credentials
- .gitignore protecting secrets from version control

---

## 👨‍💻 Developer

**Diptanil Sen**
Built as part of college project — AI-Powered Photo Management System

© 2026 Drishyamitra