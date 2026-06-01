"""
StudyBuddy AI — FastAPI Backend
Proxies Gemini 2.5 Flash API with SSE streaming.
"""

import os
import json
import asyncio
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from datetime import datetime, timezone, timedelta
import random

from database import get_db
from models import UserProfile, OtpRequest, OtpVerifyRequest, ProfileUpdate, QuizScoreIn, ActivityLog
from auth import get_current_user_uid, get_current_user
from email_service import send_otp_email, send_progress_report
# ── Load environment ─────────────────────────────────────────────────────────
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_ID = "gemini-2.5-flash"

# ── Lazy-import Gemini (gives a better error if not installed) ────────────────
try:
    from google import genai
    from google.genai import types as genai_types
    _client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
except ImportError:
    genai = None
    _client = None

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="StudyBuddy AI API", version="2.0.0")

# Build allowed origins — always include localhost for development,
# plus any deployed frontend URL set via the FRONTEND_URL env var.
_FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip()
_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
if _FRONTEND_URL:
    _ALLOWED_ORIGINS.append(_FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from security import limiter
from logger import logger
from cache import generate_cache_key, get_from_cache, set_in_cache
from rag_memory import save_chat_context, get_recent_chat_context
from rag_vector import process_pdf, add_document_to_rag, search_rag

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


# ── System prompts ────────────────────────────────────────────────────────────
PROMPTS = {
    "chat": (
        "You are StudyBuddy AI, an expert tutor for students. Explain any "
        "concept clearly using simple language, real analogies, and examples. "
        "Format: use **bold** for key terms, bullet points for steps/lists, "
        "> blockquotes for important notes, and backticks for code. "
        "Be encouraging, concise, and student-friendly."
    ),
    "quiz": (
        "Generate exactly 5 multiple-choice quiz questions on the given topic. "
        'Return ONLY a raw JSON array, no markdown, no explanation: '
        '[{"q":"question text","opts":["A","B","C","D"],"ans":0}] '
        "ans is 0-indexed. Make questions progressively harder. Be accurate."
    ),
    "summarizer": (
        "Summarize the given text into exactly three sections. "
        "Format your response EXACTLY like this (use these exact headers):\n"
        "##KEYPOINTS##\n"
        "- point 1\n"
        "- point 2\n"
        "##DEFINITIONS##\n"
        "Term1: definition\n"
        "##TLDR##\n"
        "3-sentence summary here"
    ),
    "flashcards": (
        "Generate exactly 8 flashcards for the given topic. "
        'Return ONLY a raw JSON array: '
        '[{"front":"question","back":"answer"}] '
        "Questions should test deep understanding. Mix conceptual and factual."
    ),
        "detector": (
        "Classify the subject of the following text. "
        "Reply with EXACTLY one word from this list: "
        "Mathematics, Physics, Chemistry, Biology, ComputerScience, "
        "History, Literature, Economics, Geography, General. "
        "Nothing else. One word only."
    ),
    "mindmap": (
        "Generate a Mermaid.js mindmap diagram for the given topic. "
        "Use the 'mindmap' syntax in Mermaid. Do not wrap in markdown blocks, just return the raw Mermaid syntax string. "
        "Structure it hierarchically with the main topic at the root. "
        "Example:\nmindmap\n  root((Topic))\n    Subtopic1\n      Detail A\n    Subtopic2"
    ),
    "arxiv": (
        "You are a PhD-level research assistant. Summarize the following research paper abstract. "
        "Highlight the main problem, the methodology, and the key findings. "
        "Structure the output with clear headings. "
        "Format using Markdown."
    ),
    "storymode": (
        "You are an expert storyteller for children (grades 1-10). "
        "Write an engaging, fun, and highly educational story about the given topic. "
        "The story should explain the core concepts of the topic through characters and a plot. "
        "Format using Markdown. Use emojis. Keep it under 800 words."
    ),
    "code_pair": (
        "You are an expert Senior Software Engineer and Pair Programmer. "
        "The user will provide a code snippet and a question or issue. "
        "Provide a clear, concise, and highly technical response. "
        "Point out potential bugs, security flaws, performance issues, or suggest cleaner ways to write the code. "
        "Format using Markdown and use proper code blocks with language tags."
    )
}

import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

from pydantic import BaseModel, Field

# ── Request schemas ───────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" | "model"
    content: str = Field(..., max_length=10000)

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    level: str = "General"
    uid: str = None

class SimpleRequest(BaseModel):
    text: str = Field(..., max_length=10000)
    level: str = "General"

# ── Helper ────────────────────────────────────────────────────────────────────
def get_client():
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY not set. Add it to backend/.env and restart."
        )
    if not genai or not _client:
        raise HTTPException(
            status_code=503,
            detail="google-genai package not installed. Run: pip install google-genai"
        )
    return _client

def build_contents(messages: list[ChatMessage]):
    """Convert frontend message format to Gemini contents format."""
    contents = []
    for msg in messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append(
            genai_types.Content(
                role=role,
                parts=[genai_types.Part(text=msg.content)]
            )
        )
    return contents

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "key_set": bool(GEMINI_API_KEY),
        "sdk_available": genai is not None,
    }


@app.post("/api/chat")
@limiter.limit("20/minute")
async def chat_stream(request: Request, req: ChatRequest, user: dict = Depends(get_current_user)):
    """SSE streaming chat endpoint."""
    client = get_client()

    async def generate() -> AsyncGenerator[str, None]:
        try:
            logger.info("chat_started", level=req.level, messages_count=len(req.messages))
            
            context = ""
            if req.uid and req.messages:
                # Save user's latest prompt
                latest_msg = req.messages[-1].content
                await save_chat_context(req.uid, "user", latest_msg)
                # Fetch recent memory context
                context = await get_recent_chat_context(req.uid)
                # Fetch RAG context from uploaded documents
                rag_context = search_rag(req.uid, latest_msg)

            contents = build_contents(req.messages)
            system_inst = f"{PROMPTS['chat']}\n\nThe user is a {req.level} student. Adjust your explanation complexity, tone, and depth to be perfectly suited for this education level."
            if context:
                system_inst += f"\n\nHere is the recent conversation history with this student to help you remember context:\n{context}"
            if 'rag_context' in locals() and rag_context:
                system_inst += f"\n\nHere is additional context retrieved from the user's uploaded documents that might be relevant to the query:\n{rag_context}"
                
            config = genai_types.GenerateContentConfig(
                system_instruction=system_inst,
                max_output_tokens=1500,
                temperature=0.7,
            )
            response = await client.aio.models.generate_content_stream(
                model=MODEL_ID,
                contents=contents,
                config=config,
            )

            full_response = []
            async for chunk in response:
                text = ""
                try:
                    text = chunk.text or ""
                except Exception:
                    pass
                if text:
                    full_response.append(text)
                    payload = json.dumps({"text": text})
                    yield f"data: {payload}\n\n"

            yield "data: [DONE]\n\n"
            
            if req.uid and full_response:
                await save_chat_context(req.uid, "assistant", "".join(full_response))

        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                yield f'data: {json.dumps({"error": "Rate limit hit. Wait a moment and try again."})}\n\n'
            else:
                yield f'data: {json.dumps({"error": error_msg})}\n\n'
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/quiz")
@limiter.limit("10/minute")
async def generate_quiz(request: Request, req: SimpleRequest, user: dict = Depends(get_current_user)):
    cache_key = generate_cache_key("quiz", text=req.text, level=req.level)
    if cached := get_from_cache(cache_key):
        logger.info("cache_hit", endpoint="quiz")
        return JSONResponse({"result": cached})
        
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=f"Generate a quiz about: {req.text}",
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['quiz']}\n\nThe user is a {req.level} student. Adjust the difficulty and complexity of the questions to be perfectly suited for this education level.",
                    max_output_tokens=1500,
                    temperature=0.4,
                    response_mime_type="application/json",
                ),
            )
        )
        set_in_cache(cache_key, response.text)
        logger.info("quiz_generated", text_len=len(req.text))
        return JSONResponse({"result": response.text})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit. Please wait and try again.")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/summarize")
@limiter.limit("10/minute")
async def summarize(request: Request, req: SimpleRequest, user: dict = Depends(get_current_user)):
    cache_key = generate_cache_key("summarize", text=req.text, level=req.level)
    if cached := get_from_cache(cache_key):
        logger.info("cache_hit", endpoint="summarize")
        return JSONResponse({"result": cached})
        
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=f"Summarize this text:\n\n{req.text}",
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['summarizer']}\n\nThe user is a {req.level} student. Adjust the complexity of the summary and definitions to be perfectly suited for this education level.",
                    max_output_tokens=1500,
                    temperature=0.3,
                ),
            )
        )
        set_in_cache(cache_key, response.text)
        logger.info("summary_generated", text_len=len(req.text))
        return JSONResponse({"result": response.text})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit. Please wait and try again.")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload a document (PDF or Text) for True RAG semantic search."""
    uid = user.get("uid")
    if uid == "anonymous":
        raise HTTPException(status_code=401, detail="Must be logged in to upload documents.")
        
    try:
        content_bytes = await file.read()
        
        text_content = ""
        if file.filename.endswith(".pdf"):
            text_content = process_pdf(content_bytes)
        else:
            # Assume text based
            text_content = content_bytes.decode("utf-8")
            
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document.")
            
        add_document_to_rag(uid, file.filename, text_content)
        
        logger.info("document_uploaded_for_rag", uid=uid, filename=file.filename)
        return {"status": "success", "message": f"Successfully processed {file.filename} for RAG."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── WebSockets for Multiplayer Study Rooms ────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        logger.info("websocket_connected", room=room_id, total_clients=len(self.active_connections[room_id]))

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/api/ws/chat/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: str):
    """Multiplayer Study Room WebSocket endpoint."""
    await manager.connect(websocket, room_id)
    try:
        while True:
            # Wait for any user in the room to send a message
            data = await websocket.receive_text()
            
            # Broadcast user's message to everyone
            await manager.broadcast(f"User: {data}", room_id)
            
            # Ask Gemini for a response
            client = get_client()
            response = await client.aio.models.generate_content(
                model=MODEL_ID,
                contents=data,
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"You are a collaborative AI Tutor in a multiplayer study room.",
                    max_output_tokens=500,
                    temperature=0.7,
                ),
            )
            
            # Broadcast AI's message to everyone
            ai_text = response.text or "I'm thinking..."
            await manager.broadcast(f"AI Tutor: {ai_text}", room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast("A user has left the study room.", room_id)



@app.post("/api/flashcards")
@limiter.limit("10/minute")
async def flashcards(request: Request, req: SimpleRequest, user: dict = Depends(get_current_user)):
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=f"Create flashcards for: {req.text}",
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['flashcards']}\n\nThe user is a {req.level} student. Adjust the complexity of the flashcards to be perfectly suited for this education level.",
                    max_output_tokens=1500,
                    temperature=0.5,
                    response_mime_type="application/json",
                ),
            )
        )
        return JSONResponse({"result": response.text})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit. Please wait and try again.")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/detect-subject")
@limiter.limit("20/minute")
async def detect_subject(request: Request, req: SimpleRequest, user: dict = Depends(get_current_user)):
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=req.text,
                config=genai_types.GenerateContentConfig(
                    system_instruction=PROMPTS["detector"],
                    max_output_tokens=10,
                    temperature=0.1,
                ),
            )
        )
        return JSONResponse({"result": response.text.strip()})
    except Exception:
        return JSONResponse({"result": "General"})


@app.post("/api/mindmap")
@limiter.limit("10/minute")
async def generate_mindmap(request: Request, req: SimpleRequest, user: dict = Depends(get_current_user)):
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=f"Topic: {req.text}",
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['mindmap']}\n\nThe user is a {req.level} student. Adjust the depth and complexity of the mindmap to be perfectly suited for this education level.",
                    max_output_tokens=1500,
                    temperature=0.4,
                ),
            )
        )
        # Strip potential markdown blocks if the model still includes them
        res_text = response.text.strip()
        if res_text.startswith("```mermaid"):
            res_text = res_text[10:]
        if res_text.startswith("```"):
            res_text = res_text[3:]
        if res_text.endswith("```"):
            res_text = res_text[:-3]
        return JSONResponse({"result": res_text.strip()})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit. Please wait and try again.")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/arxiv")
@limiter.limit("10/minute")
async def summarize_arxiv(request: Request, req: SimpleRequest, user: dict = Depends(get_current_user)):
    query = req.text.strip()
    
    # 1. Fetch from ArXiv API
    try:
        # ArXiv API uses search_query. E.g., all:electron
        encoded_query = urllib.parse.quote(query)
        url = f"http://export.arxiv.org/api/query?search_query={encoded_query}&start=0&max_results=3"
        with urllib.request.urlopen(url, timeout=10) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        namespace = {"atom": "http://www.w3.org/2005/Atom"}
        entries = root.findall("atom:entry", namespace)
        
        if not entries:
            return JSONResponse({"result": "No ArXiv papers found for this query."})
            
        # Get the first result's abstract and title
        first_entry = entries[0]
        title = first_entry.find("atom:title", namespace).text.strip().replace("\n", " ")
        abstract = first_entry.find("atom:summary", namespace).text.strip()
        authors = [a.find("atom:name", namespace).text for a in first_entry.findall("atom:author", namespace)]
        link = first_entry.find("atom:id", namespace).text
        
        paper_info = f"Title: {title}\nAuthors: {', '.join(authors)}\nLink: {link}\n\nAbstract: {abstract}"
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch from ArXiv: {str(e)}")

    # 2. Ask Gemini to summarize
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        gemini_res = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=paper_info,
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['arxiv']}\n\nThe user is a {req.level} student. Adjust your summary complexity, tone, and depth to be perfectly suited for this education level.",
                    max_output_tokens=1500,
                    temperature=0.3,
                ),
            )
        )
        final_result = f"### [{title}]({link})\n**Authors:** {', '.join(authors)}\n\n" + gemini_res.text.strip()
        return JSONResponse({"result": final_result})
    except Exception as e:
        error_msg = str(e)
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/storymode")
@limiter.limit("10/minute")
async def generate_story(request: Request, req: SimpleRequest):
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=f"Topic: {req.text}",
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['storymode']}\n\nThe user is a {req.level} student. Adjust your story complexity, tone, and depth to be perfectly suited for this education level.",
                    max_output_tokens=1500,
                    temperature=0.7, # Higher temperature for more creativity
                ),
            )
        )
        return JSONResponse({"result": response.text.strip()})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit. Please wait and try again.")
        raise HTTPException(status_code=500, detail=error_msg)


@app.post("/api/code-pair")
@limiter.limit("10/minute")
async def generate_code_pair(request: Request, req: SimpleRequest):
    client = get_client()
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=MODEL_ID,
                contents=req.text,
                config=genai_types.GenerateContentConfig(
                    system_instruction=f"{PROMPTS['code_pair']}\n\nThe user is a {req.level} student. Adjust your technical explanations and complexity to be perfectly suited for this education level.",
                    max_output_tokens=2048,
                    temperature=0.2, # Low temperature for more accuracy in code
                ),
            )
        )
        return JSONResponse({"result": response.text.strip()})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit. Please wait and try again.")
        raise HTTPException(status_code=500, detail=error_msg)


# ── Auth Endpoints ────────────────────────────────────────────────────────────

@app.post("/api/auth/sync-user")
async def sync_user(decoded_token: dict = Depends(get_current_user)):
    try:
        db = get_db()
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name", email.split('@')[0] if email else "User")
        avatar_url = decoded_token.get("picture")

        user = await db.users.find_one({"firebase_uid": uid})
        if not user:
            new_user = UserProfile(
                firebase_uid=uid,
                email=email,
                name=name,
                avatar_url=avatar_url,
                created_at=datetime.now(timezone.utc),
                last_seen=datetime.now(timezone.utc)
            )
            await db.users.insert_one(new_user.model_dump())
            return {"status": "created", "user": new_user.model_dump()}
        else:
            await db.users.update_one(
                {"firebase_uid": uid},
                {"$set": {"last_seen": datetime.now(timezone.utc)}}
            )
            user['_id'] = str(user['_id'])
            return {"status": "synced", "user": user}
    except Exception as e:
        logger.error("sync_user_db_error", error=str(e))
        raise HTTPException(status_code=500, detail="Database operation failed")

@app.post("/api/auth/send-otp")
async def send_otp(req: OtpRequest):
    try:
        db = get_db()
        otp_code = str(random.randint(100000, 999999))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        await db.otps.update_one(
            {"email": req.email},
            {"$set": {"code": otp_code, "expires_at": expires_at, "name": req.name}},
            upsert=True
        )
        
        success = send_otp_email(req.email, otp_code, req.name)
        if success is False:
             raise HTTPException(status_code=500, detail="Failed to send OTP email")
        return {"status": "sent"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("send_otp_db_error", error=str(e))
        raise HTTPException(status_code=500, detail="Database operation failed")

@app.post("/api/auth/verify-otp")
async def verify_otp(req: OtpVerifyRequest):
    try:
        db = get_db()
        otp_doc = await db.otps.find_one({"email": req.email})
        if not otp_doc:
            raise HTTPException(status_code=400, detail="No OTP found for this email")
        
        if otp_doc.get("code") != req.code:
            raise HTTPException(status_code=400, detail="Invalid OTP")
            
        expires_at = otp_doc.get("expires_at")
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
            
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="OTP expired")
            
        await db.otps.delete_one({"email": req.email})
        
        # Mark user as verified in DB
        await db.users.update_one({"email": req.email}, {"$set": {"email_verified": True}})
        return {"status": "verified"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("verify_otp_db_error", error=str(e))
        raise HTTPException(status_code=500, detail="Database operation failed")

@app.get("/api/auth/me")
async def get_me(uid: str = Depends(get_current_user_uid)):
    db = get_db()
    user = await db.users.find_one({"firebase_uid": uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user['_id'] = str(user['_id'])
    return user

@app.put("/api/auth/profile")
async def update_profile(update_data: ProfileUpdate, uid: str = Depends(get_current_user_uid)):
    db = get_db()
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_dict:
        return {"status": "no changes"}
        
    await db.users.update_one({"firebase_uid": uid}, {"$set": update_dict})
    return {"status": "updated"}

# ── User Data Endpoints ────────────────────────────────────────────────────────

@app.post("/api/user/quiz-score")
async def save_quiz_score(score_in: QuizScoreIn, background_tasks: BackgroundTasks, uid: str = Depends(get_current_user_uid)):
    db = get_db()
    
    # 1. Save score
    doc = score_in.model_dump()
    doc["firebase_uid"] = uid
    doc["timestamp"] = datetime.now(timezone.utc)
    await db.quiz_scores.insert_one(doc)
    
    # 2. Fetch user to get email for progress report
    user = await db.users.find_one({"firebase_uid": uid})
    if user and user.get("email"):
        background_tasks.add_task(
            send_progress_report,
            to_email=user["email"],
            name=user.get("name", ""),
            topic=score_in.topic,
            score=score_in.score,
            total=score_in.total
        )
        
    return {"status": "saved"}

@app.get("/api/user/scores")
async def get_scores(uid: str = Depends(get_current_user_uid)):
    db = get_db()
    cursor = db.quiz_scores.find({"firebase_uid": uid}).sort("timestamp", -1).limit(50)
    scores = await cursor.to_list(length=50)
    for s in scores:
        s["_id"] = str(s["_id"])
    return scores

@app.post("/api/user/activity")
async def log_activity(activity: ActivityLog, uid: str = Depends(get_current_user_uid)):
    db = get_db()
    doc = activity.model_dump()
    doc["firebase_uid"] = uid
    doc["timestamp"] = datetime.now(timezone.utc)
    await db.activity_log.insert_one(doc)
    return {"status": "logged"}

@app.get("/api/user/recommendations")
async def get_recommendations(uid: str = Depends(get_current_user_uid)):
    # We will implement this logic in recommendations.py later.
    # For now, return a stub.
    from recommendations import generate_recommendations
    try:
        plan = await generate_recommendations(uid, get_client())
        return plan
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return {"error": str(e)}

# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    import uvicorn
    sys.stdout.reconfigure(encoding='utf-8')
    print("\nStudyBuddy AI Backend")
    print(f"   Model: {MODEL_ID}")
    print(f"   API Key: {'SET' if GEMINI_API_KEY else 'MISSING - edit backend/.env'}")
    print("   Running on http://localhost:8000\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
