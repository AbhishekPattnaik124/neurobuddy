import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

# Initialize Firebase Admin
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
else:
    print(f"WARNING: Firebase service account key not found at {cred_path}")

def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not credentials:
        # Fallback for Streamlit which doesn't currently send tokens
        return {"uid": "anonymous"}
        
    token = credentials.credentials
    if not firebase_admin._apps:
        raise HTTPException(status_code=500, detail="Firebase Admin SDK not initialized.")
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

def get_current_user_uid(decoded_token: dict = Security(verify_firebase_token)) -> str:
    return decoded_token.get("uid")

def get_current_user(decoded_token: dict = Security(verify_firebase_token)) -> dict:
    return decoded_token
