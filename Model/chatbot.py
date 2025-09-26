"""
Mental Health Support Chatbot using Ollama Llama 3.1 8B
Designed for SIH25092 - Mental Health Support System
Author: SIH Team
Version: 1.0.0
"""

import ollama
import json
import datetime
import re
import time
import sqlite3
import hashlib
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import logging
from collections import deque
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mental_health_chatbot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Mental health severity levels
class SeverityLevel(Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

# Emotion categories
class EmotionCategory(Enum):
    ANXIOUS = "anxious"
    DEPRESSED = "depressed"
    STRESSED = "stressed"
    ANGRY = "angry"
    LONELY = "lonely"
    CONFUSED = "confused"
    HOPEFUL = "hopeful"
    NEUTRAL = "neutral"

@dataclass
class UserProfile:
    """User profile for personalized support"""
    user_id: str
    name: Optional[str] = None
    age: Optional[int] = None
    previous_concerns: List[str] = None
    risk_level: str = "low"
    last_interaction: str = None
    session_count: int = 0
    preferred_coping_strategies: List[str] = None
    emergency_contacts: Dict[str, str] = None
    
    def __post_init__(self):
        if self.previous_concerns is None:
            self.previous_concerns = []
        if self.preferred_coping_strategies is None:
            self.preferred_coping_strategies = []
        if self.emergency_contacts is None:
            self.emergency_contacts = {}

class CrisisDetector:
    """Detects crisis situations and triggers appropriate responses"""
    
    def __init__(self):
        self.crisis_keywords = {
            'critical': [
                'suicide', 'kill myself', 'end my life', 'want to die',
                'better off dead', 'no reason to live', 'self harm',
                'cut myself', 'overdose', 'jump off', 'hang myself'
            ],
            'high': [
                'hopeless', 'worthless', 'can\'t go on', 'give up',
                'no point', 'hate myself', 'panic attack', 'can\'t breathe',
                'heart racing', 'going crazy', 'losing mind'
            ],
            'moderate': [
                'depressed', 'anxious', 'stressed', 'overwhelmed',
                'lonely', 'isolated', 'crying', 'can\'t sleep',
                'nightmares', 'worried sick'
            ]
        }
        
        self.support_patterns = {
            'strength_indicators': [
                'trying', 'hope', 'better', 'improve', 'cope',
                'manage', 'help', 'support', 'friend', 'family'
            ],
            'resource_seeking': [
                'therapist', 'counselor', 'doctor', 'medication',
                'treatment', 'therapy', 'professional help'
            ]
        }
    
    def assess_risk_level(self, message: str) -> Tuple[SeverityLevel, List[str]]:
        """Assess the risk level of a message"""
        message_lower = message.lower()
        detected_keywords = []
        
        # Check for critical keywords
        for keyword in self.crisis_keywords['critical']:
            if keyword in message_lower:
                detected_keywords.append(keyword)
                return SeverityLevel.CRITICAL, detected_keywords
        
        # Check for high risk keywords
        for keyword in self.crisis_keywords['high']:
            if keyword in message_lower:
                detected_keywords.append(keyword)
        
        if detected_keywords:
            return SeverityLevel.HIGH, detected_keywords
        
        # Check for moderate risk keywords
        for keyword in self.crisis_keywords['moderate']:
            if keyword in message_lower:
                detected_keywords.append(keyword)
        
        if detected_keywords:
            return SeverityLevel.MODERATE, detected_keywords
        
        return SeverityLevel.LOW, []
    
    def get_crisis_resources(self, severity: SeverityLevel) -> Dict[str, any]:
        """Get appropriate crisis resources based on severity"""
        resources = {
            SeverityLevel.CRITICAL: {
                'immediate_action': True,
                'helplines': [
                    {'name': 'National Suicide Prevention Lifeline', 'number': '9152987821'},
                    {'name': 'AASRA', 'number': '9820466726'},
                    {'name': 'Vandrevala Foundation', 'number': '1860 2662 345'}
                ],
                'message': "I'm deeply concerned about what you're sharing. Your life has value, and help is available right now.",
                'safety_plan': True
            },
            SeverityLevel.HIGH: {
                'immediate_action': False,
                'helplines': [
                    {'name': 'iCALL', 'number': '9152987821'},
                    {'name': 'COOJ Mental Health Foundation', 'number': '0832-2252525'}
                ],
                'message': "I can see you're going through a really tough time. You don't have to face this alone.",
                'coping_strategies': True
            },
            SeverityLevel.MODERATE: {
                'immediate_action': False,
                'resources': [
                    'Deep breathing exercises',
                    'Mindfulness meditation',
                    'Progressive muscle relaxation',
                    'Journaling'
                ],
                'message': "I hear that you're struggling. Let's work through this together.",
                'self_care': True
            },
            SeverityLevel.LOW: {
                'immediate_action': False,
                'resources': ['General wellness tips', 'Stress management'],
                'message': "I'm here to support you. How can I help you today?",
                'preventive_care': True
            }
        }
        return resources.get(severity, resources[SeverityLevel.LOW])

class EmotionAnalyzer:
    """Analyzes emotional content and patterns in conversations"""
    
    def __init__(self):
        self.emotion_lexicon = {
            EmotionCategory.ANXIOUS: [
                'anxious', 'worried', 'nervous', 'panic', 'fear',
                'scared', 'tense', 'restless', 'on edge', 'uneasy'
            ],
            EmotionCategory.DEPRESSED: [
                'sad', 'depressed', 'hopeless', 'empty', 'numb',
                'worthless', 'guilty', 'ashamed', 'despair', 'miserable'
            ],
            EmotionCategory.STRESSED: [
                'stressed', 'overwhelmed', 'pressure', 'burden',
                'exhausted', 'burned out', 'tired', 'drained'
            ],
            EmotionCategory.ANGRY: [
                'angry', 'frustrated', 'irritated', 'mad', 'furious',
                'annoyed', 'resentful', 'bitter', 'hostile'
            ],
            EmotionCategory.LONELY: [
                'lonely', 'alone', 'isolated', 'disconnected',
                'abandoned', 'rejected', 'unwanted', 'forgotten'
            ],
            EmotionCategory.CONFUSED: [
                'confused', 'lost', 'uncertain', 'doubtful',
                'conflicted', 'torn', 'unclear', 'mixed'
            ],
            EmotionCategory.HOPEFUL: [
                'hopeful', 'optimistic', 'positive', 'better',
                'improving', 'confident', 'motivated', 'encouraged'
            ]
        }
        
        self.emotion_history = deque(maxlen=10)
    
    def analyze_emotion(self, text: str) -> Tuple[EmotionCategory, float]:
        """Analyze the primary emotion in text"""
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in self.emotion_lexicon.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if not emotion_scores:
            return EmotionCategory.NEUTRAL, 0.0
        
        primary_emotion = max(emotion_scores, key=emotion_scores.get)
        confidence = emotion_scores[primary_emotion] / sum(emotion_scores.values())
        
        self.emotion_history.append(primary_emotion)
        return primary_emotion, confidence
    
    def get_emotion_trend(self) -> Dict[EmotionCategory, int]:
        """Get emotion trends from history"""
        trend = {}
        for emotion in self.emotion_history:
            trend[emotion] = trend.get(emotion, 0) + 1
        return trend

class TherapeuticInterventions:
    """Provides evidence-based therapeutic interventions"""
    
    def __init__(self):
        self.interventions = {
            EmotionCategory.ANXIOUS: {
                'techniques': [
                    'grounding_exercise',
                    'breathing_technique',
                    'progressive_muscle_relaxation',
                    'mindfulness_meditation'
                ],
                'cognitive_reframes': [
                    "Let's examine these worries together. Often, our anxious thoughts overestimate danger.",
                    "Anxiety is uncomfortable but temporary. It will pass.",
                    "What evidence do you have for and against this worry?"
                ]
            },
            EmotionCategory.DEPRESSED: {
                'techniques': [
                    'behavioral_activation',
                    'gratitude_practice',
                    'social_connection',
                    'routine_building'
                ],
                'cognitive_reframes': [
                    "Depression often tells us lies about ourselves. You are not your thoughts.",
                    "Small steps count. What's one tiny thing you could do today?",
                    "This feeling is temporary, even though it doesn't feel that way right now."
                ]
            },
            EmotionCategory.STRESSED: {
                'techniques': [
                    'time_management',
                    'boundary_setting',
                    'stress_reduction',
                    'self_care_planning'
                ],
                'cognitive_reframes': [
                    "Let's break this down into smaller, manageable pieces.",
                    "What's in your control right now? Let's focus there.",
                    "It's okay to ask for help. You don't have to handle everything alone."
                ]
            }
        }
    
    def get_grounding_exercise(self) -> str:
        """5-4-3-2-1 grounding technique"""
        return """Let's try a grounding exercise together:
        
        Take a deep breath and notice:
        • 5 things you can SEE around you
        • 4 things you can TOUCH near you
        • 3 things you can HEAR right now
        • 2 things you can SMELL
        • 1 thing you can TASTE
        
        This helps bring your attention back to the present moment."""
    
    def get_breathing_technique(self) -> str:
        """Box breathing technique"""
        return """Let's practice box breathing:
        
        1. Breathe IN for 4 counts
        2. HOLD for 4 counts
        3. Breathe OUT for 4 counts
        4. HOLD for 4 counts
        
        Repeat this 4-5 times. This activates your body's relaxation response."""
    
    def get_behavioral_activation(self) -> str:
        """Behavioral activation for depression"""
        return """When we're depressed, we often stop doing things we enjoy. Let's gently change that:
        
        1. Think of ONE small activity you used to enjoy
        2. Can you do a tiny version of it today? (Even 5 minutes counts)
        3. Notice how you feel before and after
        
        Small actions can create positive momentum."""

class ConversationManager:
    """Manages conversation flow and context"""
    
    def __init__(self, db_path: str = "mental_health_chat.db"):
        self.db_path = db_path
        self.init_database()
        self.conversation_history = deque(maxlen=20)
        self.current_session_id = None
    
    def init_database(self):
        """Initialize SQLite database for conversation storage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                user_id TEXT,
                timestamp DATETIME,
                user_message TEXT,
                bot_response TEXT,
                emotion_detected TEXT,
                risk_level TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                profile_data TEXT,
                created_at DATETIME,
                last_updated DATETIME
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_conversation(self, user_id: str, user_message: str, 
                         bot_response: str, emotion: str, risk_level: str):
        """Save conversation to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversations 
            (session_id, user_id, timestamp, user_message, bot_response, emotion_detected, risk_level)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            self.current_session_id,
            user_id,
            datetime.datetime.now().isoformat(),
            user_message,
            bot_response,
            emotion,
            risk_level
        ))
        
        conn.commit()
        conn.close()
    
    def get_conversation_context(self, limit: int = 5) -> List[Dict]:
        """Get recent conversation context"""
        return list(self.conversation_history)[-limit:]

class MentalHealthChatbot:
    """Main chatbot class integrating all components"""
    
    def __init__(self, model_name: str = "llama3.1:8b"):
        self.model_name = model_name
        self.crisis_detector = CrisisDetector()
        self.emotion_analyzer = EmotionAnalyzer()
        self.interventions = TherapeuticInterventions()
        self.conversation_manager = ConversationManager()
        self.current_user = None
        
        # System prompt for mental health support
        self.system_prompt = """You are a compassionate and professional mental health support assistant. Your role is to:

1. Provide empathetic, non-judgmental support
2. Listen actively and validate feelings
3. Offer evidence-based coping strategies
4. Recognize crisis situations and provide appropriate resources
5. Encourage professional help when needed
6. Maintain boundaries and clarify you're not a replacement for professional therapy

Guidelines:
- Always validate emotions before offering solutions
- Use person-first language
- Be warm but maintain professional boundaries
- Never diagnose or prescribe medications
- Encourage professional help for serious concerns
- Focus on strengths and resilience
- Provide practical, actionable suggestions
- Check in on safety when concerning statements are made

Remember: You're a support tool, not a therapist. Always encourage professional help when appropriate."""
    
    def generate_response(self, user_input: str, context: List[Dict] = None) -> str:
        """Generate empathetic response using Ollama"""
        
        # Build conversation context
        messages = [
            {"role": "system", "content": self.system_prompt}
        ]
        
        if context:
            for ctx in context[-3:]:  # Last 3 exchanges for context
                messages.append({"role": "user", "content": ctx.get('user', '')})
                messages.append({"role": "assistant", "content": ctx.get('assistant', '')})
        
        messages.append({"role": "user", "content": user_input})
        
        try:
            # Generate response using Ollama
            response = ollama.chat(
                model=self.model_name,
                messages=messages,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            )
            
            return response['message']['content']
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I'm here to listen and support you. Could you tell me more about what you're experiencing?"
    
    def handle_crisis_response(self, severity: SeverityLevel, user_input: str) -> str:
        """Handle crisis situations with appropriate response"""
        resources = self.crisis_detector.get_crisis_resources(severity)
        
        response = f"{resources['message']}\n\n"
        
        if severity == SeverityLevel.CRITICAL:
            response += "**Immediate Support Available:**\n"
            for helpline in resources['helplines']:
                response += f"• {helpline['name']}: {helpline['number']}\n"
            
            response += "\n**Safety Plan:**\n"
            response += "1. Remove any means of self-harm from your immediate area\n"
            response += "2. Call one of the helplines above or go to your nearest emergency room\n"
            response += "3. Stay with someone you trust or ask someone to stay with you\n"
            response += "4. Focus on getting through the next hour, then the next\n"
            
        elif severity == SeverityLevel.HIGH:
            response += self.interventions.get_grounding_exercise()
            response += "\n\n**Support Lines:**\n"
            for helpline in resources['helplines']:
                response += f"• {helpline['name']}: {helpline['number']}\n"
        
        return response
    
    def provide_intervention(self, emotion: EmotionCategory) -> str:
        """Provide targeted intervention based on emotion"""
        if emotion == EmotionCategory.ANXIOUS:
            return self.interventions.get_breathing_technique()
        elif emotion == EmotionCategory.DEPRESSED:
            return self.interventions.get_behavioral_activation()
        elif emotion == EmotionCategory.STRESSED:
            technique = self.interventions.get_grounding_exercise()
            return technique
        else:
            return ""
    
    def process_message(self, user_id: str, message: str) -> Dict[str, any]:
        """Process user message and generate appropriate response"""
        
        # Analyze risk level
        severity, crisis_keywords = self.crisis_detector.assess_risk_level(message)
        
        # Analyze emotion
        emotion, confidence = self.emotion_analyzer.analyze_emotion(message)
        
        # Get conversation context
        context = self.conversation_manager.get_conversation_context()
        
        # Generate response based on severity
        if severity in [SeverityLevel.CRITICAL, SeverityLevel.HIGH]:
            primary_response = self.handle_crisis_response(severity, message)
            ai_response = self.generate_response(message, context)
            response = f"{primary_response}\n\n{ai_response}"
        else:
            response = self.generate_response(message, context)
            
            # Add intervention if appropriate
            if confidence > 0.6:
                intervention = self.provide_intervention(emotion)
                if intervention:
                    response += f"\n\n{intervention}"
        
        # Add follow-up check for moderate to high risk
        if severity in [SeverityLevel.MODERATE, SeverityLevel.HIGH]:
            response += "\n\nHow are you feeling right now? Is there anything specific I can help you with?"
        
        # Save conversation
        self.conversation_manager.save_conversation(
            user_id, message, response, 
            emotion.value, severity.value
        )
        
        # Update conversation history
        self.conversation_manager.conversation_history.append({
            'user': message,
            'assistant': response,
            'emotion': emotion.value,
            'severity': severity.value
        })
        
        return {
            'response': response,
            'emotion_detected': emotion.value,
            'emotion_confidence': confidence,
            'risk_level': severity.value,
            'crisis_keywords': crisis_keywords,
            'emotion_trend': self.emotion_analyzer.get_emotion_trend()
        }
    
    def start_session(self, user_id: str) -> str:
        """Start a new chat session"""
        self.conversation_manager.current_session_id = hashlib.md5(
            f"{user_id}_{datetime.datetime.now().isoformat()}".encode()
        ).hexdigest()
        
        welcome_message = """Hello! I'm here to provide emotional support and help you navigate whatever you're going through. 
        
This is a safe, confidential space where you can express yourself freely. I'm not a replacement for professional therapy, but I'm here to listen, support, and provide coping strategies.

How are you feeling today? What brings you here?"""
        
        return welcome_message
    
    def end_session(self, user_id: str) -> str:
        """End chat session with resources"""
        ending_message = """Thank you for sharing with me today. Remember:
        
• Your feelings are valid
• Healing is not linear
• It's okay to ask for help
• You've shown strength by reaching out

**Ongoing Support Resources:**
• National Mental Health Helpline: 1800-599-0019
• iCALL: 9152987821
• Vandrevala Foundation: 1860 2662 345

**Self-Care Reminders:**
• Practice self-compassion
• Maintain regular sleep schedule
• Stay connected with supportive people
• Engage in activities you enjoy
• Consider professional therapy if needed

Take care of yourself. You matter. 💙"""
        
        return ending_message

class ChatInterface:
    """Command-line interface for the chatbot"""
    
    def __init__(self):
        self.chatbot = MentalHealthChatbot()
        self.user_id = None
        
    def get_user_id(self) -> str:
        """Get or create user ID"""
        print("\n" + "="*50)
        print("Mental Health Support Chat - SIH25092")
        print("="*50)
        
        user_choice = input("\n1. New User\n2. Returning User\nSelect option (1/2): ").strip()
        
        if user_choice == "2":
            user_id = input("Enter your User ID: ").strip()
        else:
            name = input("Enter your name (optional, press Enter to skip): ").strip()
            user_id = hashlib.md5(f"{name or 'anonymous'}_{time.time()}".encode()).hexdigest()[:8]
            print(f"\nYour User ID is: {user_id}")
            print("Please save this ID for future sessions")
        
        return user_id
    
    def display_response_analysis(self, analysis: Dict):
        """Display emotion and risk analysis"""
        print("\n" + "-"*40)
        print(f"Emotion Detected: {analysis['emotion_detected']} (Confidence: {analysis['emotion_confidence']:.2f})")
        print(f"Risk Level: {analysis['risk_level']}")
        
        if analysis['crisis_keywords']:
            print(f"Concerning phrases detected: {', '.join(analysis['crisis_keywords'])}")
        
        if analysis['emotion_trend']:
            print("\nEmotion Trend:")
            for emotion, count in analysis['emotion_trend'].items():
                print(f"  • {emotion.value}: {count}")
        print("-"*40 + "\n")
    
    def run(self):
        """Run the chat interface"""
        try:
            # Get user ID
            self.user_id = self.get_user_id()
            
            # Start session
            welcome = self.chatbot.start_session(self.user_id)
            print(f"\n🤖 Assistant: {welcome}")
            
            print("\n(Type 'exit' to end the session, 'help' for commands)")
            print("-"*50)
            
            while True:
                # Get user input
                user_input = input("\n👤 You: ").strip()
                
                if not user_input:
                    continue
                
                # Check for commands
                if user_input.lower() == 'exit':
                    ending = self.chatbot.end_session(self.user_id)
                    print(f"\n🤖 Assistant: {ending}")
                    break
                
                elif user_input.lower() == 'help':
                    print("\nCommands:")
                    print("• exit - End the session")
                    print("• help - Show this help message")
                    print("• resources - Show mental health resources")
                    continue
                
                elif user_input.lower() == 'resources':
                    resources = """
Mental Health Resources:

**Crisis Helplines (India):**
• National Mental Health Helpline: 1800-599-0019
• AASRA: 9820466726
• iCALL: 9152987821
• Vandrevala Foundation: 1860 2662 345
• COOJ: 0832-2252525

**Mental Health Apps:**
• Headspace - Meditation
• Calm - Sleep & Meditation
• Youper - Emotional Health
• Sanvello - Anxiety Support

**Online Therapy Platforms:**
• BetterHelp
• Talkspace
• Amaha (formerly InnerHour)
• YourDOST

**Self-Help Resources:**
• NIMHANS Digital Academy
• Mind.org.uk
• Psychology Today
                    """
                    print(resources)
                    continue
                
                # Process message
                print("\n🤖 Processing...")
                result = self.chatbot.process_message(self.user_id, user_input)
                
                # Display response
                print(f"\n🤖 Assistant: {result['response']}")
                
                # Display analysis (optional - can be toggled)
                if result['risk_level'] != 'low':
                    self.display_response_analysis(result)
        
        except KeyboardInterrupt:
            print("\n\nSession interrupted. Take care!")
        except Exception as e:
            logger.error(f"Error in chat interface: {e}")
            print(f"\nAn error occurred: {e}")
            print("Please restart the application.")

def main():
    """Main entry point"""
    print("""
╔══════════════════════════════════════════════════════╗
║     Mental Health Support Chatbot - SIH25092        ║
║                                                      ║
║  AI-Powered Emotional Support & Crisis Intervention ║
║                                                      ║
║  Remember: This is a support tool, not a substitute ║
║            for professional mental health care      ║
╚══════════════════════════════════════════════════════╝
    """)
    
    # Check if Ollama is available
    try:
        ollama.list()
        print("✓ Ollama connection successful")
    except Exception as e:
        print(f"✗ Error connecting to Ollama: {e}")
        print("Please ensure Ollama is running with Llama 3.1 8B model")
        print("Run: ollama pull llama3.1:8b")
        return
    
    # Initialize and run chat interface
    chat_interface = ChatInterface()
    chat_interface.run()

if __name__ == "__main__":
    main()