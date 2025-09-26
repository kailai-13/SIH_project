# main.py (Fully Corrected Version)
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, validator
from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import uuid
import logging
import os
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

app = FastAPI(
    title="Mental Health Support API",
    description="Backend for Student Wellness Platform",
    version="2.0.0"
)

# CORS middleware
# Update your CORS middleware in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


# Enums
class UserRole(str, Enum):
    STUDENT = "student"
    ADMIN = "admin"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

# Database schemas (in-memory for demo)
users_db = {}
sessions_db = {}
bookings_db = []
mood_entries_db = []

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    age: Optional[int] = None
    student_id: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        # Check byte length for bcrypt compatibility
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be 72 bytes or less')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 16 or v > 100):
            raise ValueError('Age must be between 16 and 100')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    user_id: str
    hashed_password: str
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime
    last_login: Optional[datetime] = None

class UserResponse(UserBase):
    user_id: str
    status: UserStatus
    created_at: datetime
    last_login: Optional[datetime] = None

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

# Simple mock chatbot for demo
class SimpleChatbot:
    def start_session(self, user_id):
        return "Hello! I'm your mental health support assistant. I'm here to listen and help you with stress, anxiety, or any concerns you might have. What's on your mind today?"
    
    def process_message(self, user_id, message):
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

# Password hashing functions using bcrypt directly
def hash_password(password: str) -> str:
    '''Hash a password using bcrypt'''
    try:
        # Convert password to bytes
        pwd_bytes = password.encode('utf-8')
        
        # Check length limit for bcrypt (72 bytes max)
        if len(pwd_bytes) > 72:
            raise ValueError("Password too long for bcrypt (max 72 bytes)")
        
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
        
        # Return as string for storage
        return hashed_password.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {e}")
        raise ValueError("Failed to hash password")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    '''Verify a password against its hash'''
    try:
        # Convert to bytes
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        
        # Verify password
        return bcrypt.checkpw(password=password_bytes, hashed_password=hash_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

# Utility functions
def get_user_by_email(email: str):
    for user in users_db.values():
        if user.email == email:
            return user
    return None

def get_user_by_id(user_id: str):
    return users_db.get(user_id)

def authenticate_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(username)
    if user is None:
        raise credentials_exception
    
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is not active"
        )
    
    return user

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    return current_user

def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: UserInDB = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Demo users initialization
def init_demo_users():
    if not users_db:  # Only initialize if empty
        demo_users = [
            {
                "name": "Demo Student",
                "email": "student@demo.com",
                "password": "123456",
                "role": UserRole.STUDENT,
                "age": 21,
                "student_id": "STU12345"
            },
            {
                "name": "Demo Admin",
                "email": "admin@demo.com",
                "password": "123456",
                "role": UserRole.ADMIN,
                "age": 30,
                "student_id": None
            }
        ]
        
        for user_data in demo_users:
            try:
                user_id = str(uuid.uuid4())
                user = UserInDB(
                    user_id=user_id,
                    name=user_data["name"],
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]),
                    role=user_data["role"],
                    age=user_data["age"],
                    student_id=user_data["student_id"],
                    status=UserStatus.ACTIVE,
                    created_at=datetime.utcnow()
                )
                users_db[user_id] = user
                logger.info(f"Demo user created: {user_data['email']}")
            except Exception as e:
                logger.error(f"Failed to create demo user {user_data['email']}: {e}")

# Routes
@app.on_event("startup")
async def startup_event():
    init_demo_users()

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    try:
        # Check if user already exists
        if get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = str(uuid.uuid4())
        user = UserInDB(
            user_id=user_id,
            name=user_data.name,
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            role=user_data.role,
            age=user_data.age,
            student_id=user_data.student_id,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow()
        )
        
        users_db[user_id] = user
        logger.info(f"New user registered: {user_data.email}")
        
        return UserResponse(**user.dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/auth/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    return UserResponse(**current_user.dict())

@app.post("/auth/logout")
async def logout(current_user: UserInDB = Depends(get_current_active_user)):
    return {"message": "Successfully logged out"}

# Chat endpoints
@app.post("/chat/start")
async def start_chat(current_user: UserInDB = Depends(get_current_active_user)):
    try:
        welcome_message = chatbot.start_session(current_user.user_id)
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
    current_user: UserInDB = Depends(get_current_active_user)
):
    try:
        result = chatbot.process_message(current_user.user_id, chat_data.message)
        
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

# Booking endpoints (student only)
@app.post("/bookings/create")
async def create_booking(
    booking: BookingRequest,
    current_user: UserInDB = Depends(require_role([UserRole.STUDENT]))
):
    try:
        booking_id = str(uuid.uuid4())
        booking_data = {
            "id": booking_id,
            "user_id": current_user.user_id,
            "user_name": current_user.name,
            "date": booking.date,
            "time": booking.time,
            "concerns": booking.concerns,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        
        bookings_db.append(booking_data)
        return {"success": True, "booking_id": booking_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create booking")

@app.get("/bookings/my")
async def get_my_bookings(current_user: UserInDB = Depends(get_current_active_user)):
    user_bookings = [b for b in bookings_db if b['user_id'] == current_user.user_id]
    return {"success": True, "bookings": user_bookings}

@app.get("/bookings/all")
async def get_all_bookings(current_user: UserInDB = Depends(require_role([UserRole.ADMIN]))):
    return {"success": True, "bookings": bookings_db}

# Mood endpoints (student only)
@app.post("/mood/entry")
async def add_mood_entry(
    mood_data: MoodEntry,
    current_user: UserInDB = Depends(require_role([UserRole.STUDENT]))
):
    try:
        entry_id = str(uuid.uuid4())
        entry = {
            "id": entry_id,
            "user_id": current_user.user_id,
            "user_name": current_user.name,
            "mood": mood_data.mood,
            "note": mood_data.note,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        mood_entries_db.append(entry)
        return {"success": True, "entry_id": entry_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add mood entry")

@app.get("/mood/history")
async def get_mood_history(current_user: UserInDB = Depends(get_current_active_user)):
    user_entries = [m for m in mood_entries_db if m['user_id'] == current_user.user_id]
    return {"success": True, "entries": user_entries}

# Admin endpoints
@app.get("/admin/stats")
async def get_admin_stats(current_user: UserInDB = Depends(require_role([UserRole.ADMIN]))):
    stats = {
        "total_users": len(users_db),
        "active_users": len([u for u in users_db.values() if u.status == UserStatus.ACTIVE]),
        "student_users": len([u for u in users_db.values() if u.role == UserRole.STUDENT]),
        "admin_users": len([u for u in users_db.values() if u.role == UserRole.ADMIN]),
        "total_bookings": len(bookings_db),
        "total_mood_entries": len(mood_entries_db),
        "pending_bookings": len([b for b in bookings_db if b['status'] == 'pending'])
    }
    
    return {"success": True, "stats": stats}

@app.get("/admin/users")
async def get_all_users(current_user: UserInDB = Depends(require_role([UserRole.ADMIN]))):
    users_list = [UserResponse(**user.dict()) for user in users_db.values()]
    return {"success": True, "users": users_list}

# Health check
@app.get("/")
async def root():
    return {
        "message": "Mental Health Support API v2.0 is running",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "features": ["JWT Authentication", "Direct BCrypt Hashing", "Role-based Authorization"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
