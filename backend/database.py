import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI")
client = None
db = None

def get_db():
    global client, db
    if not MONGODB_URI:
        # Avoid crashing immediately on import if not set, but raise when used
        raise ValueError("MONGODB_URI not set. Add it to .env")
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client.NeuroBuddy
    return db
