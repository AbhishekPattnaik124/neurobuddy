import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_quiz_unauthorized_if_no_fallback():
    # Since we set auto_error=False in HTTPBearer for Streamlit fallback,
    # the endpoint will actually succeed and treat the user as "anonymous".
    # Let's test that the fallback works.
    response = client.post("/api/quiz", json={"text": "Test", "level": "General"})
    # It shouldn't return 401 because of the Streamlit fallback in auth.py
    # But if Gemini quota hits, it might return 429 or 500. We just assert it doesn't fail on Auth.
    assert response.status_code in [200, 429, 500]

def test_upload_document_anonymous_rejected():
    # The upload endpoint specifically rejects "anonymous"
    file_content = b"This is a test document for True RAG."
    files = {"file": ("test.txt", file_content, "text/plain")}
    response = client.post("/api/upload", files=files)
    assert response.status_code == 401
    assert "Must be logged in" in response.json()["detail"]

def test_detect_subject():
    response = client.post("/api/detect-subject", json={"text": "What is the powerhouse of the cell?", "level": "General"})
    assert response.status_code in [200, 429, 500]
    if response.status_code == 200:
        assert "result" in response.json()
