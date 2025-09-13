from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:5173",  # your Vite/React dev server
        "http://0.0.0.0:5000"     # if you test locally on this port
    ]
)


# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SESSION_TYPE'] = 'filesystem'

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    age = db.Column(db.Integer)
    bio = db.Column(db.Text)
    profile_image_url = db.Column(db.String(255))
    points = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    skills = db.relationship('UserSkill', backref='user', lazy=True, cascade='all, delete-orphan')
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'age': self.age,
            'bio': self.bio,
            'profile_image_url': self.profile_image_url,
            'points': self.points,
            'level': self.level,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'skills': [skill.to_dict() for skill in self.skills] if self.skills else []
        }

class Skill(db.Model):
    __tablename__ = 'skills'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'icon': self.icon
        }

class UserSkill(db.Model):
    __tablename__ = 'user_skills'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    skill_id = db.Column(db.String(36), db.ForeignKey('skills.id'), nullable=False)
    proficiency_level = db.Column(db.Integer, nullable=False, default=1)  # 1-10 scale
    want_to_teach = db.Column(db.Boolean, default=False)
    want_to_learn = db.Column(db.Boolean, default=False)
    years_experience = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    skill = db.relationship('Skill', backref='user_skills')
    
    def to_dict(self):
        return {
            'id': self.id,
            'skill': self.skill.to_dict() if self.skill else None,
            'proficiency_level': self.proficiency_level,
            'want_to_teach': self.want_to_teach,
            'want_to_learn': self.want_to_learn,
            'years_experience': self.years_experience
        }

class SkillMatch(db.Model):
    __tablename__ = 'skill_matches'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user1_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    skill_id = db.Column(db.String(36), db.ForeignKey('skills.id'), nullable=False)
    match_percentage = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])
    skill = db.relationship('Skill')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user1': {'id': self.user1.id, 'username': self.user1.username} if self.user1 else None,
            'user2': {'id': self.user2.id, 'username': self.user2.username} if self.user2 else None,
            'skill': self.skill.to_dict() if self.skill else None,
            'match_percentage': self.match_percentage
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    room_id = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, system, image, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        sender_data = None
        if hasattr(self, 'sender') and self.sender:
            sender_data = {'id': self.sender.id, 'username': self.sender.username}
        return {
            'id': self.id,
            'sender': sender_data,
            'room_id': self.room_id,
            'content': self.content,
            'message_type': self.message_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MeetingRoom(db.Model):
    __tablename__ = 'meeting_rooms'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    creator_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    zoom_meeting_id = db.Column(db.String(100))
    zoom_join_url = db.Column(db.String(500))
    scheduled_time = db.Column(db.DateTime)
    max_participants = db.Column(db.Integer, default=10)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('User', backref='created_rooms')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator': {'id': self.creator.id, 'username': self.creator.username} if self.creator else None,
            'zoom_meeting_id': self.zoom_meeting_id,
            'zoom_join_url': self.zoom_join_url,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'max_participants': self.max_participants,
            'is_active': self.is_active
        }

# Initialize database
def create_tables():
    with app.app_context():
        db.create_all()
        
        # Create default skills if they don't exist
        default_skills = [
            {'name': 'Python Programming', 'category': 'Technology', 'description': 'Programming in Python', 'icon': 'code'},
            {'name': 'Cooking', 'category': 'Life Skills', 'description': 'Culinary arts and cooking techniques', 'icon': 'chef-hat'},
            {'name': 'Gardening', 'category': 'Hobbies', 'description': 'Growing plants and maintaining gardens', 'icon': 'flower'},
            {'name': 'Piano', 'category': 'Music', 'description': 'Playing piano and music theory', 'icon': 'music'},
            {'name': 'Photography', 'category': 'Creative', 'description': 'Digital and film photography', 'icon': 'camera'},
            {'name': 'Language - Spanish', 'category': 'Languages', 'description': 'Spanish language skills', 'icon': 'globe'},
            {'name': 'Knitting', 'category': 'Crafts', 'description': 'Knitting and yarn crafts', 'icon': 'scissors'},
            {'name': 'Chess', 'category': 'Games', 'description': 'Strategic chess playing', 'icon': 'gamepad-2'}
        ]
        
        for skill_data in default_skills:
            existing_skill = Skill.query.filter_by(name=skill_data['name']).first()
            if not existing_skill:
                skill = Skill(**skill_data)
                db.session.add(skill)
        
        db.session.commit()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)