from database import get_db
import joblib
import os
import numpy as np

# Load ML Models if they exist
MODEL_PATH = "student_model.pkl"
SCALER_PATH = "scaler.pkl"
kmeans_model = None
scaler = None

if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
    kmeans_model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

async def generate_recommendations(uid: str, client):
    db = get_db()
    
    cursor = db.quiz_scores.find({"firebase_uid": uid}).sort("timestamp", -1).limit(20)
    scores = await cursor.to_list(length=20)
    
    if not scores:
        return {"plan": "Take a quiz to start building your personalized study plan! 🚀"}
        
    history = "\n".join([f"- Topic: {s['topic']}, Score: {s['pct']}%" for s in scores])
    
    # ML Clustering Profile
    ml_profile = ""
    if kmeans_model and scaler:
        try:
            # Calculate average score to approximate their features for the KMeans model
            avg_score = np.mean([s['pct'] for s in scores])
            # Assuming math, reading, writing are roughly similar for this mock integration
            features = scaler.transform([[avg_score, avg_score, avg_score]])
            cluster = kmeans_model.predict(features)[0]
            
            # The model is trained on a Kaggle Student Performance dataset
            ml_profile = f"According to our ML clustering model, this student is in 'Cluster {cluster}'. " \
                         f"Please use this to structure their plan appropriately (e.g. if their average score is low, provide more fundamental resources).\n\n"
        except Exception as e:
            print("ML Prediction Error:", e)

    prompt = (
        "You are an expert AI Study Coach. Based on the student's recent quiz scores, "
        "provide a very brief, personalized study plan highlighting their strengths "
        "and 1-2 areas to focus on. Keep it under 50 words and use emojis.\n\n"
        f"{ml_profile}"
        f"Scores:\n{history}"
    )
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {"plan": response.text.strip()}
    except Exception as e:
        return {"plan": f"Keep practicing! ({str(e)})"}
