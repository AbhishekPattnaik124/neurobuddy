# NeuroBuddy 🚀🧠

An intelligent, multi-platform educational assistant built to provide deeply personalized learning experiences. It integrates **Machine Learning (Scikit-Learn)** for student profiling and **Generative AI (Google Gemini)** for real-time tutoring.

## ✨ Key Features
- 📱 **Dual Interfaces**: Access the platform via a rich React web application or a streamlined Streamlit dashboard.
- 💬 **AI Tutor with Memory**: Real-time SSE streaming chat that remembers your previous conversations via MongoDB.
- 🎓 **Generative Study Tools**: 
  - Automated 5-question multiple-choice quizzes.
  - Flashcard generation.
  - Mindmap generation (Mermaid.js).
  - Scientific paper summarization (via ArXiv API).
  - Code Pair programming for CS students.
- 🧬 **Machine Learning Profiling**: Tracks quiz scores and clusters users using KMeans (trained on Kaggle student performance data) to perfectly tailor the AI's strictness and teaching style.
- 🛡️ **Enterprise Backend**: Features rate limiting (SlowAPI), TTLCache caching, and structured JSON logging.

## 🛠️ Technology Stack
- **Frontend (Web)**: Vite, React, Firebase Auth, Tailwind/Custom CSS.
- **Frontend (Dashboard)**: Streamlit.
- **Backend API**: Python, FastAPI, Uvicorn, Google GenAI SDK.
- **Database**: MongoDB (Motor async driver).
- **Machine Learning**: Scikit-Learn, Pandas, Joblib.

## 📂 Project Structure
```text
ai_study_buddy/
├── backend/
│   ├── .env                 # Backend environment variables
│   ├── main.py              # FastAPI server (Routes, Streaming)
│   ├── database.py          # MongoDB configuration
│   ├── rag_memory.py        # AI Chat History Memory
│   ├── security.py          # SlowAPI Rate Limiting
│   ├── cache.py             # TTLCache logic
│   ├── logger.py            # Structlog configuration
│   ├── train_model.py       # ML KMeans training script
│   ├── student_model.pkl    # Exported ML model
│   └── requirements.txt     # Python dependencies
├── src/                     # React Frontend source code
│   ├── components/
│   ├── pages/
│   ├── utils/api.js         # API interface (Fetch, SSE)
│   └── firebase.js          # Firebase configuration
├── streamlit_frontend/
│   └── app.py               # Streamlit application
├── PRD.md                   # Product Requirements Document
└── TRD.md                   # Technical Requirements Document
```

## 🚀 Installation & Setup

### 1. Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install Python dependencies: `pip install -r requirements.txt`
3. Create a `.env` file in the `backend` folder with the following variables:
   ```ini
   GEMINI_API_KEY=your_google_gemini_api_key
   MONGO_URI=mongodb://localhost:27017
   ```
4. Start the FastAPI server: `python -m uvicorn main:app --reload` (Runs on `http://localhost:8000`)

*(Optional: To retrain the ML model on new data, place a `StudentsPerformance.csv` in the backend folder and run `python train_model.py`)*

### 2. React Frontend Setup
1. Navigate to the root directory: `cd ai_study_buddy`
2. Install Node dependencies: `npm install`
3. Add your Firebase config to `src/firebase.js`.
4. Start the Vite dev server: `npm run dev` (Runs on `http://localhost:5173`)

### 3. Streamlit Setup (Alternative Interface)
1. Navigate to the `streamlit_frontend` directory: `cd streamlit_frontend`
2. Install Streamlit: `pip install streamlit`
3. Start the dashboard: `python -m streamlit run app.py` (Runs on `http://localhost:8501`)
