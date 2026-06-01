# Technical Requirements Document (TRD)
**Project Name:** NeuroBuddy
**Document Version:** 1.0

## 1. System Architecture Overview
The application follows a decoupled Client-Server architecture with two distinct clients consuming a centralized RESTful and SSE API.

*   **Client A:** React Single Page Application (SPA).
*   **Client B:** Streamlit Python Web App.
*   **API Gateway/Server:** FastAPI (Python).
*   **Database:** MongoDB.
*   **External Services:** Firebase Auth, Google Gemini API, ArXiv API.

## 2. Technology Stack

### 2.1. Frontend (React)
*   **Framework:** Vite + React (JavaScript).
*   **Routing:** `react-router-dom`.
*   **Styling:** Custom CSS with modern UI/UX principles (Glassmorphism, Dark Mode).
*   **Authentication:** Firebase JS SDK.
*   **API Communication:** Native `fetch` with Server-Sent Events (SSE) decoding.

### 2.2. Frontend (Streamlit)
*   **Framework:** Streamlit (Python).
*   **Authentication:** Custom Firebase integration via Streamlit session state.
*   **Purpose:** Lightweight, data-driven dashboard for internship demonstration.

### 2.3. Backend API (FastAPI)
*   **Framework:** FastAPI (Asynchronous Python).
*   **Server:** Uvicorn.
*   **Database Driver:** `motor` (Asynchronous MongoDB driver).
*   **Generative AI SDK:** `google-genai` (Official Google Gemini SDK).

## 3. Data & Machine Learning Layer

### 3.1. Database Schema (MongoDB)
*   **`users` Collection:** Stores Firebase UID, education level, and preferences.
*   **`quiz_scores` Collection:** Stores historical quiz performance (`topic`, `score`, `total`, `timestamp`).
*   **`chat_history` Collection:** Stores chat messages (`role`, `content`, `timestamp`) for AI Long-Term Memory context retrieval.

### 3.2. Machine Learning Pipeline
*   **Library:** `scikit-learn`.
*   **Algorithm:** KMeans Clustering (4 clusters).
*   **Training Data:** Synthetically generated dataset structurally identical to the Kaggle "Students Performance in Exams" dataset.
*   **Artifacts:** Exported via `joblib` (`student_model.pkl`, `scaler.pkl`).
*   **Integration:** The FastAPI server loads the `.pkl` files on startup into memory.

## 4. Security, Observability & Performance

### 4.1. Rate Limiting (Security)
*   **Tool:** `slowapi`.
*   **Implementation:** 
    *   `/api/chat`: Limited to 20 req/min.
    *   `/api/quiz`, `/api/summarize`: Limited to 10 req/min.

### 4.2. Caching (Performance)
*   **Tool:** `cachetools` (TTLCache).
*   **Implementation:** Expensive AI generations (Quizzes, Summaries) are hashed by their payload. Identical requests hit the in-memory cache instantly without calling the Gemini API, expiring after 1 hour.

### 4.3. Observability
*   **Tool:** `structlog`.
*   **Implementation:** All prints replaced with structured JSON logs tracking `endpoint`, `level`, `cache_hits`, and errors for easy log aggregation.
*   **Health Checks:** `/health` endpoint exposes API version and status.

## 5. API Endpoint Definition

| Endpoint | Method | Description | Security |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | Returns server status. | None |
| `/api/chat` | POST | SSE Stream for conversational AI. Injects MongoDB Memory. | Rate-limited (20/min) |
| `/api/quiz` | POST | Generates a 5-question JSON quiz. | Cached, Rate-limited |
| `/api/summarize` | POST | Summarizes text into sections. | Cached, Rate-limited |
| `/api/arxiv` | POST | Queries ArXiv XML API, parses, and summarizes via Gemini. | Rate-limited |
| `/api/detect-subject`| POST | Classifies text into an academic subject. | Rate-limited |
