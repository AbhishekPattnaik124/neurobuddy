# Product Requirements Document (PRD)
**Project Name:** NeuroBuddy
**Document Version:** 1.0

## 1. Product Vision & Objective
The "NeuroBuddy" is a next-generation, multi-platform educational assistant designed to provide deeply personalized learning experiences. Unlike standard chatbots, this product integrates traditional Machine Learning (clustering) with Generative AI to mathematically profile a student's weaknesses and automatically tailor the strictness, tone, and complexity of the AI tutor.

## 2. Target Audience
*   **Primary Users:** High school and university students needing help with homework, concept breakdowns, and exam preparation.
*   **Secondary Users:** Lifelong learners, researchers (via ArXiv integrations), and younger children (via Story Mode).

## 3. Core Features & Requirements

### 3.1. Dual-Interface Access
*   **Requirement:** The platform must be accessible via a rich Web Application (React) for daily consumer use, and a lightweight Dashboard (Streamlit) for academic/internship demonstration.
*   **Constraint:** Both interfaces must utilize the exact same centralized API.

### 3.2. Authentication & User Management
*   **Requirement:** Secure login and registration using Firebase Authentication.
*   **Requirement:** Users can update their profile (Education Level) which directly impacts AI prompt complexity.

### 3.3. AI Tutor with Long-Term Memory
*   **Requirement:** A real-time chat interface (streaming) where the AI acts as a tutor.
*   **Requirement:** The AI must remember past conversations across sessions to reference previous struggles or concepts.

### 3.4. Generative Study Tools
*   **Automated Quizzes:** Generate 5-question multiple-choice quizzes on any topic.
*   **Smart Flashcards:** Create dynamic front/back flashcards for spaced repetition.
*   **ArXiv Summarization:** Fetch real research papers by topic and summarize their abstracts into readable formats for university students.
*   **Mindmap Generation:** Generate Mermaid.js syntax for visual topic breakdowns.
*   **Story Mode:** Explain complex scientific or historical topics as engaging stories for younger audiences.
*   **Code Pair:** Act as a senior software engineer to review and explain code snippets.

### 3.5. Machine Learning Student Profiling
*   **Requirement:** Track user performance on quizzes.
*   **Requirement:** Periodically run the user's historical data through a KMeans clustering model trained on standardized student performance data (Kaggle).
*   **Requirement:** Inject the calculated "Study Profile" (e.g., Math-Focused, Struggling, High-Achiever) into the Generative AI's prompt to dynamically alter its teaching style.

## 4. User Flow
1.  **Onboarding:** User signs up via Firebase and sets their Education Level.
2.  **Assessment:** User takes an AI-generated quiz on a topic.
3.  **Profiling (Background):** The backend ML model clusters the user based on quiz scores.
4.  **Learning:** User asks the AI Tutor a question. The backend retrieves their ML profile and recent chat history from MongoDB, feeding it to Gemini to produce a perfectly contextualized answer.
