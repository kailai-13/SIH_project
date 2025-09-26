# main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
import datetime
from chatbot import MentalHealthChatbot, UserProfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Mental Health Support API",
    description="Backend for SIH25092 Mental Health Support System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize chatbot
chatbot = MentalHealthChatbot()

# In-memory storage (replace with database in production)
sessions = {}
user_profiles = {}

# Pydantic models
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    age: Optional[int] = None
    student_id: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    emotion_detected: str
    emotion_confidence: float
    risk_level: str
    crisis_keywords: List[str]
    emotion_trend: Dict[str, int]

class BookingRequest(BaseModel):
    name: str
    date: str
    time: str
    concerns: Optional[str] = None

class MoodEntry(BaseModel):
    mood: str
    note: Optional[str] = None

class UserSession(BaseModel):
    user_id: str
    name: str
    email: str
    is_admin: bool = False

# Authentication and session management
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    # In production, validate JWT token
    user_id = credentials.credentials
    if user_id in sessions:
        return sessions[user_id]
    raise HTTPException(status_code=401, detail="Invalid token")

# Authentication routes
@app.post("/auth/register")
async def register(user_data: UserRegister):
    """Register new user"""
    user_id = str(uuid.uuid4())
    
    # Create user profile
    profile = UserProfile(
        user_id=user_id,
        name=user_data.name,
        age=user_data.age
    )
    
    # Store user (in production, hash password)
    user_profiles[user_id] = {
        'profile': profile,
        'email': user_data.email,
        'password': user_data.password,  # Hash in production
        'is_admin': user_data.email.endswith('@admin.com')  # Simple admin detection
    }
    
    # Create session
    session = UserSession(
        user_id=user_id,
        name=user_data.name,
        email=user_data.email,
        is_admin=user_data.email.endswith('@admin.com')
    )
    sessions[user_id] = session
    
    return {
        "user_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "is_admin": session.is_admin,
        "token": user_id  # Simple token for demo
    }

@app.post("/auth/login")
async def login(login_data: UserLogin):
    """Login user"""
    # Find user by email (in production, use database query)
    user_id = None
    user_data = None
    
    for uid, data in user_profiles.items():
        if data['email'] == login_data.email and data['password'] == login_data.password:
            user_id = uid
            user_data = data
            break
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    profile = user_data['profile']
    session = UserSession(
        user_id=user_id,
        name=profile.name,
        email=user_data['email'],
        is_admin=user_data['is_admin']
    )
    sessions[user_id] = session
    
    return {
        "user_id": user_id,
        "name": profile.name,
        "email": user_data['email'],
        "is_admin": user_data['is_admin'],
        "token": user_id
    }

@app.post("/auth/logout")
async def logout(current_user: UserSession = Depends(get_current_user)):
    """Logout user"""
    if current_user.user_id in sessions:
        del sessions[current_user.user_id]
    return {"message": "Logged out successfully"}

# Chat routes
@app.post("/chat/start")
async def start_chat(current_user: UserSession = Depends(get_current_user)):
    """Start new chat session"""
    welcome_message = chatbot.start_session(current_user.user_id)
    session_id = chatbot.conversation_manager.current_session_id
    
    return {
        "message": welcome_message,
        "session_id": session_id,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/chat/message")
async def send_message(
    chat_data: ChatMessage,
    current_user: UserSession = Depends(get_current_user)
):
    """Send message to chatbot"""
    try:
        if chat_data.session_id:
            chatbot.conversation_manager.current_session_id = chat_data.session_id
        
        result = chatbot.process_message(current_user.user_id, chat_data.message)
        
        return ChatResponse(
            response=result['response'],
            session_id=chatbot.conversation_manager.current_session_id,
            emotion_detected=result['emotion_detected'],
            emotion_confidence=result['emotion_confidence'],
            risk_level=result['risk_level'],
            crisis_keywords=result['crisis_keywords'],
            emotion_trend=result['emotion_trend']
        )
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        raise HTTPException(status_code=500, detail="Error processing message")

@app.post("/chat/end")
async def end_chat(current_user: UserSession = Depends(get_current_user)):
    """End chat session"""
    ending_message = chatbot.end_session(current_user.user_id)
    return {"message": ending_message}

# Booking system routes
bookings_db = []

@app.post("/bookings/create")
async def create_booking(
    booking: BookingRequest,
    current_user: UserSession = Depends(get_current_user)
):
    """Create new booking"""
    booking_id = str(uuid.uuid4())
    booking_data = {
        "id": booking_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "date": booking.date,
        "time": booking.time,
        "concerns": booking.concerns,
        "status": "pending",
        "created_at": datetime.datetime.now().isoformat()
    }
    
    bookings_db.append(booking_data)
    return {"booking_id": booking_id, "message": "Booking created successfully"}

@app.get("/bookings/my")
async def get_my_bookings(current_user: UserSession = Depends(get_current_user)):
    """Get user's bookings"""
    user_bookings = [b for b in bookings_db if b['user_id'] == current_user.user_id]
    return {"bookings": user_bookings}

@app.get("/bookings/all")
async def get_all_bookings(current_user: UserSession = Depends(get_current_user)):
    """Get all bookings (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {"bookings": bookings_db}

# Mood tracker routes
mood_entries_db = []

@app.post("/mood/entry")
async def add_mood_entry(
    mood_data: MoodEntry,
    current_user: UserSession = Depends(get_current_user)
):
    """Add mood entry"""
    entry_id = str(uuid.uuid4())
    entry = {
        "id": entry_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "mood": mood_data.mood,
        "note": mood_data.note,
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    mood_entries_db.append(entry)
    return {"entry_id": entry_id, "message": "Mood entry added successfully"}

@app.get("/mood/history")
async def get_mood_history(current_user: UserSession = Depends(get_current_user)):
    """Get user's mood history"""
    user_entries = [m for m in mood_entries_db if m['user_id'] == current_user.user_id]
    return {"entries": user_entries}

@app.get("/mood/analytics")
async def get_mood_analytics(current_user: UserSession = Depends(get_current_user)):
    """Get mood analytics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Calculate mood distribution
    mood_counts = {}
    for entry in mood_entries_db:
        mood_counts[entry['mood']] = mood_counts.get(entry['mood'], 0) + 1
    
    return {
        "total_entries": len(mood_entries_db),
        "mood_distribution": mood_counts,
        "recent_entries": mood_entries_db[-10:]  # Last 10 entries
    }

# Admin dashboard routes
@app.get("/admin/stats")
async def get_admin_stats(current_user: UserSession = Depends(get_current_user)):
    """Get admin dashboard statistics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Calculate statistics
    total_users = len(user_profiles)
    total_bookings = len(bookings_db)
    total_mood_entries = len(mood_entries_db)
    pending_bookings = len([b for b in bookings_db if b['status'] == 'pending'])
    
    # Recent activity
    recent_activities = []
    recent_activities.extend(bookings_db[-5:])
    recent_activities.extend(mood_entries_db[-5:])
    recent_activities.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_mood_entries": total_mood_entries,
        "pending_bookings": pending_bookings,
        "recent_activities": recent_activities[:10]
    }

# Health check
@app.get("/")
async def root():
    return {"message": "Mental Health Support API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)