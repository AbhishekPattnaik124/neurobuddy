from database import get_db
from datetime import datetime, timezone
import json

async def save_chat_context(uid: str, role: str, content: str):
    """Save a chat message to MongoDB to act as long-term memory."""
    db = get_db()
    if not db:
        return
        
    doc = {
        "firebase_uid": uid,
        "role": role,
        "content": content,
        "timestamp": datetime.now(timezone.utc)
    }
    await db.chat_history.insert_one(doc)

async def get_recent_chat_context(uid: str, limit: int = 10) -> str:
    """Retrieve the last N messages to inject into the AI prompt."""
    db = get_db()
    if not db:
        return ""
        
    cursor = db.chat_history.find({"firebase_uid": uid}).sort("timestamp", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    if not messages:
        return ""
        
    # Reverse to chronological order
    messages.reverse()
    
    context_lines = ["\n[Long-Term Memory Context]"]
    for msg in messages:
        role_label = "Student" if msg["role"] == "user" else "AI Tutor"
        context_lines.append(f"{role_label}: {msg['content']}")
    
    context_lines.append("[End of Context]\n")
    return "\n".join(context_lines)
