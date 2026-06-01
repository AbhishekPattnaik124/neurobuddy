import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_PATH = "student_model.pkl"
SCALER_PATH = "scaler.pkl"
DATASET_PATH = "StudentsPerformance.csv"

def generate_synthetic_data(num_samples=1000):
    """
    Generates synthetic data that mimics the popular Kaggle 'Students Performance in Exams' dataset.
    This is used if the real dataset isn't present in the directory.
    """
    print("Generating synthetic student performance data...")
    np.random.seed(42)
    data = {
        "math_score": np.random.normal(66, 15, num_samples).clip(0, 100).astype(int),
        "reading_score": np.random.normal(69, 14, num_samples).clip(0, 100).astype(int),
        "writing_score": np.random.normal(68, 15, num_samples).clip(0, 100).astype(int),
    }
    return pd.DataFrame(data)

def train():
    if os.path.exists(DATASET_PATH):
        print(f"Loading dataset from {DATASET_PATH}...")
        df = pd.read_csv(DATASET_PATH)
        # Ensure column names are standardized
        df.columns = [col.replace(" ", "_").replace("/", "_").lower() for col in df.columns]
    else:
        df = generate_synthetic_data()
        df.to_csv("synthetic_students_data.csv", index=False)
        print("Saved synthetic dataset to synthetic_students_data.csv")

    # We use the core scores for clustering
    features = ["math_score", "reading_score", "writing_score"]
    
    if not all(col in df.columns for col in features):
        raise ValueError(f"Dataset must contain these columns: {features}")

    X = df[features]

    print("Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("Training KMeans model with 4 clusters...")
    # 4 clusters to represent different study profiles:
    # e.g., High Achievers, Math Focused, Reading/Writing Focused, Needs Improvement
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(X_scaled)

    # Add clusters back to analyze them
    df["cluster"] = kmeans.labels_
    
    # Analyze cluster centers to assign meaningful names
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    for i, center in enumerate(centers):
        print(f"Cluster {i}: Math={center[0]:.1f}, Reading={center[1]:.1f}, Writing={center[2]:.1f}")

    print(f"Saving model to {MODEL_PATH} and scaler to {SCALER_PATH}...")
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print("Training complete!")

if __name__ == "__main__":
    train()
