# NeuroBuddy AI 🧠

> **A full-stack, multi-platform intelligent educational assistant powered by Google Gemini 2.5 Flash, Firebase, and MongoDB.**

[![Live Web App](https://img.shields.io/badge/🌐_Live_Demo-Web_App-6366f1?style=for-the-badge)](https://neurobuddy-hegt.onrender.com)

NeuroBuddy integrates **Machine Learning (Scikit-Learn KMeans clustering)** for adaptive student profiling and **Generative AI (Google Gemini 2.5 Flash)** for real-time, context-aware tutoring.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Firebase Auth** | Email/Password + Google Sign-In with OTP email verification |
| 💬 **AI Tutor (Streaming)** | SSE streaming chat with long-term memory via MongoDB |
| 🎯 **Quiz Generator** | 5-question AI MCQ quizzes with score tracking + email reports |
| 📝 **Summarizer** | Structured key points, definitions, and TL;DR |
| 🃏 **Flashcards** | AI-generated front/back flashcards for spaced repetition |
| 🧠 **Mind Maps** | Mermaid.js visual concept maps |
| 🔬 **ArXiv Summarizer** | Fetch & explain real research papers |
| 📖 **Story Mode** | Learn complex topics via engaging narrative |
| 💻 **Code Pair** | Senior-engineer code review assistant |
| 📈 **Progress Tracking** | Radar chart, streak tracking, quiz history |
| 🤖 **AI Study Coach** | KMeans ML-powered personalized study plan |
| 📄 **RAG Upload** | Upload PDFs and chat with your documents |

---

## 🛠️ Technology Stack

| Layer | Tech |
|-------|------|
| **Web Frontend** | Vite + React 19, Firebase Auth, Tailwind/Custom CSS |
| **Mobile App** | Expo (React Native), Firebase Auth, AsyncStorage |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, Google GenAI SDK |
| **Database** | MongoDB Atlas (Motor async driver) |
| **Machine Learning** | Scikit-Learn (KMeans), Pandas, Joblib |
| **Auth** | Firebase Authentication + Firebase Admin SDK |
| **Email** | Resend API (OTP + progress reports) |
| **Rate Limiting** | SlowAPI |
| **Caching** | TTLCache (cachetools) |
| **Logging** | Structlog |

---

## 📂 Project Structure

```text
ai_study_buddy/
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # All API routes (chat, quiz, auth, user data)
│   ├── auth.py                 # Firebase Admin token verification
│   ├── database.py             # MongoDB connection (Motor async)
│   ├── email_service.py        # Resend OTP + progress emails
│   ├── rag_memory.py           # Chat history long-term memory
│   ├── rag_vector.py           # TF-IDF document search (PDF upload)
│   ├── recommendations.py      # ML-powered AI study coach
│   ├── security.py             # SlowAPI rate limiter
│   ├── cache.py                # TTLCache
│   ├── logger.py               # Structlog
│   ├── models.py               # Pydantic models
│   ├── train_model.py          # KMeans training script
│   ├── student_model.pkl       # Trained ML model
│   ├── scaler.pkl              # Fitted StandardScaler
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Your backend secrets (never commit!)
│   ├── .env.example            # Template for .env
│   └── serviceAccountKey.json  # Firebase Admin credentials (never commit!)
├── src/                        # React Web Frontend
│   ├── components/             # All UI components (22 components)
│   ├── contexts/AuthContext.jsx # Firebase auth state management
│   ├── hooks/useAuth.js        # Auth actions (login, register, OTP)
│   ├── hooks/useToast.js       # Toast notifications
│   ├── utils/api.js            # All backend API calls
│   ├── firebase.js             # Firebase app initialization
│   ├── App.jsx                 # Root app with routing
│   └── index.css               # Global design system
├── mobile_app/                 # Expo React Native app
│   ├── src/
│   │   ├── app/                # Expo Router screens
│   │   ├── components/         # Native UI components
│   │   ├── contexts/           # Auth context
│   │   ├── hooks/              # useAuth hook
│   │   └── firebase.ts         # Firebase with AsyncStorage persistence
│   └── package.json
├── streamlit_frontend/         # Streamlit demo dashboard
├── .env.local                  # Frontend Firebase config (never commit!)
├── PRD.md                      # Product Requirements Document
├── TRD.md                      # Technical Requirements Document
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- Firebase project with Auth enabled
- Resend account for emails ([resend.com](https://resend.com))

---

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env` from the template:
```bash
cp .env.example .env
# Then fill in your values
```

Required variables:
```ini
GEMINI_API_KEY=AIzaSy...
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json
RESEND_API_KEY=re_...
FRONTEND_URL=http://localhost:5173
```

Download your **Firebase service account key** from Firebase Console → Project Settings → Service accounts → Generate new private key. Save as `backend/serviceAccountKey.json`.

Start the server:
```bash
python main.py
# Runs on http://localhost:8000
```

---

### 2. React Web App Setup

```bash
# From project root
npm install
```

Create `.env.local`:
```ini
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_BACKEND_URL=http://localhost:8000
```

```bash
npm run dev
# Runs on http://localhost:5173
```

---

### 3. Mobile App Setup (Expo)

```bash
cd mobile_app
npm install
```

Create `mobile_app/.env`:
```ini
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:8000   # Android emulator → localhost
```

```bash
npx expo start
```

---

### 4. Streamlit Dashboard (Optional)

```bash
cd streamlit_frontend
pip install streamlit
streamlit run app.py
# Runs on http://localhost:8501
```

---

## 🤖 Machine Learning

The KMeans clustering model is pre-trained on a Kaggle student performance dataset and stored as `backend/student_model.pkl`. To retrain:

```bash
cd backend
python train_model.py
```

---

## 🏗️ Architecture

```
Browser / Mobile
      │
      ▼
React / Expo  ──── Firebase Auth (JWT tokens)
      │
      ▼
FastAPI Backend (port 8000)
      │
      ├── Google Gemini 2.5 Flash (AI generation)
      ├── MongoDB Atlas (user data, scores, chat history)
      ├── Firebase Admin (token verification)
      ├── Resend (email: OTP + progress reports)
      └── KMeans ML (student profiling)
```
