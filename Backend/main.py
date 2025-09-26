# main.py
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Mental Health Support API",
    description="Backend for Student Wellness Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple mock chatbot for demo
class SimpleChatbot:
    def start_session(self, user_id):
        return "Hello! I'm your mental health support assistant. I'm here to listen and help you with stress, anxiety, or any concerns you might have. What's on your mind today?"
    
    def process_message(self, user_id, message):
        # Simple response logic for demo
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['stress', 'stressed', 'pressure']):
            response = "I understand you're feeling stressed. Try taking deep breaths and breaking tasks into smaller steps. Would you like to try a quick relaxation exercise?"
        elif any(word in message_lower for word in ['anxious', 'anxiety', 'worry', 'nervous']):
            response = "Anxiety can be challenging. Remember that these feelings are temporary. Let's practice some grounding techniques together."
        elif any(word in message_lower for word in ['sad', 'depressed', 'hopeless']):
            response = "I hear that you're going through a tough time. It's okay to feel this way. Would you like to talk about what's been bothering you?"
        else:
            response = "Thank you for sharing. I'm here to listen and support you. Can you tell me more about how you're feeling?"
        
        return {
            'response': response,
            'emotion_detected': 'neutral',
            'emotion_confidence': 0.7,
            'risk_level': 'low',
            'crisis_keywords': [],
            'emotion_trend': {}
        }

chatbot = SimpleChatbot()

# Data storage (in production, use a database)
users_db = {}
sessions_db = {}
bookings_db = []
mood_entries_db = []

# Pydantic models
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None
    student_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class BookingRequest(BaseModel):
    name: str
    date: str
    time: str
    concerns: Optional[str] = None

class MoodEntry(BaseModel):
    mood: str
    note: Optional[str] = None

# Authentication dependency
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Handle both "Bearer token" and just "token" formats
        if authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "").strip()
        else:
            token = authorization.strip()
        
        if token in sessions_db:
            return sessions_db[token]
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authorization")

# Routes
@app.post("/auth/register")
async def register(user_data: UserRegister):
    try:
        # Check if user already exists
        for user_id, user in users_db.items():
            if user['email'] == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        new_user = {
            'user_id': user_id,
            'name': user_data.name,
            'email': user_data.email,
            'password': user_data.password,  # In production, hash this
            'age': user_data.age,
            'student_id': user_data.student_id,
            'is_admin': user_data.email.endswith('@admin.com'),
            'created_at': datetime.datetime.now().isoformat()
        }
        
        users_db[user_id] = new_user
        
        # Create session
        session_token = user_id  # Simple token for demo
        sessions_db[session_token] = new_user
        
        logger.info(f"New user registered: {user_data.email}")
        
        return {
            "success": True,
            "user_id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "is_admin": new_user['is_admin'],
            "token": session_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/auth/login")
async def login(login_data: UserLogin):
    try:
        # Demo accounts for testing
        demo_accounts = {
            "student@demo.com": {"password": "123456", "name": "Demo Student", "is_admin": False},
            "admin@demo.com": {"password": "123456", "name": "Demo Admin", "is_admin": True}
        }
        
        # Check demo accounts first
        if login_data.email in demo_accounts:
            if login_data.password == demo_accounts[login_data.email]["password"]:
                user_id = str(uuid.uuid4())
                user_data = {
                    'user_id': user_id,
                    'name': demo_accounts[login_data.email]["name"],
                    'email': login_data.email,
                    'is_admin': demo_accounts[login_data.email]["is_admin"],
                    'created_at': datetime.datetime.now().isoformat()
                }
                
                users_db[user_id] = user_data
                session_token = user_id
                sessions_db[session_token] = user_data
                
                return {
                    "success": True,
                    "user_id": user_id,
                    "name": user_data['name'],
                    "email": user_data['email'],
                    "is_admin": user_data['is_admin'],
                    "token": session_token
                }
        
        # Check regular users
        user_found = None
        for user_id, user in users_db.items():
            if user['email'] == login_data.email:
                if user['password'] == login_data.password:
                    user_found = user
                else:
                    raise HTTPException(status_code=401, detail="Invalid password")
                break
        
        if not user_found:
            raise HTTPException(status_code=401, detail="User not found")
        
        session_token = user_found['user_id']
        sessions_db[session_token] = user_found
        
        return {
            "success": True,
            "user_id": user_found['user_id'],
            "name": user_found['name'],
            "email": user_found['email'],
            "is_admin": user_found['is_admin'],
            "token": session_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/auth/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user['user_id']
        if user_id in sessions_db:
            del sessions_db[user_id]
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Logout failed")

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

# Chat endpoints
@app.post("/chat/start")
async def start_chat(current_user: dict = Depends(get_current_user)):
    try:
        welcome_message = chatbot.start_session(current_user['user_id'])
        session_id = str(uuid.uuid4())
        
        return {
            "success": True,
            "message": welcome_message,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to start chat")

@app.post("/chat/message")
async def send_message(
    chat_data: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = chatbot.process_message(current_user['user_id'], chat_data.message)
        
        return {
            "success": True,
            "response": result['response'],
            "session_id": chat_data.session_id or str(uuid.uuid4()),
            "emotion_detected": result['emotion_detected'],
            "emotion_confidence": result['emotion_confidence'],
            "risk_level": result['risk_level']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process message")

# Booking endpoints
@app.post("/bookings/create")
async def create_booking(
    booking: BookingRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        booking_id = str(uuid.uuid4())
        booking_data = {
            "id": booking_id,
            "user_id": current_user['user_id'],
            "user_name": current_user['name'],
            "date": booking.date,
            "time": booking.time,
            "concerns": booking.concerns,
            "status": "pending",
            "created_at": datetime.datetime.now().isoformat()
        }
        
        bookings_db.append(booking_data)
        return {"success": True, "booking_id": booking_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create booking")

@app.get("/bookings/my")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    user_bookings = [b for b in bookings_db if b['user_id'] == current_user['user_id']]
    return {"success": True, "bookings": user_bookings}

# Mood endpoints
@app.post("/mood/entry")
async def add_mood_entry(
    mood_data: MoodEntry,
    current_user: dict = Depends(get_current_user)
):
    try:
        entry_id = str(uuid.uuid4())
        entry = {
            "id": entry_id,
            "user_id": current_user['user_id'],
            "user_name": current_user['name'],
            "mood": mood_data.mood,
            "note": mood_data.note,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        mood_entries_db.append(entry)
        return {"success": True, "entry_id": entry_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add mood entry")

@app.get("/mood/history")
async def get_mood_history(current_user: dict = Depends(get_current_user)):
    user_entries = [m for m in mood_entries_db if m['user_id'] == current_user['user_id']]
    return {"success": True, "entries": user_entries}

# Admin endpoints
@app.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin', False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = {
        "total_users": len(users_db),
        "total_bookings": len(bookings_db),
        "total_mood_entries": len(mood_entries_db),
        "pending_bookings": len([b for b in bookings_db if b['status'] == 'pending'])
    }
    
    return {"success": True, "stats": stats}

# Health check
@app.get("/")
async def root():
    return {
        "message": "Mental Health Support API is running",
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)