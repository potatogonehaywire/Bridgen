from flask import request, jsonify, session
from app import app, db, User, Skill, UserSkill, SkillMatch, Message, MeetingRoom
from sqlalchemy import func, or_, and_
import uuid
from datetime import datetime
import math

# User Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter(
            or_(User.username == data['username'], User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            age=data.get('age'),
            bio=data.get('bio', ''),
            profile_image_url=data.get('profile_image_url', '')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        return jsonify(user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            session['user_id'] = user.id
            return jsonify(user.to_dict()), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

# User Profile Routes
@app.route('/api/users/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user_profile(user_id):
    current_user_id = session.get('user_id')
    if not current_user_id or current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'age' in data:
            user.age = data['age']
        if 'bio' in data:
            user.bio = data['bio']
        if 'profile_image_url' in data:
            user.profile_image_url = data['profile_image_url']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Skills Routes
@app.route('/api/skills', methods=['GET'])
def get_skills():
    skills = Skill.query.all()
    return jsonify([skill.to_dict() for skill in skills]), 200

@app.route('/api/skills', methods=['POST'])
def create_skill():
    try:
        data = request.get_json()
        
        if not data.get('name') or not data.get('category'):
            return jsonify({'error': 'Name and category are required'}), 400
        
        # Check if skill already exists
        existing_skill = Skill.query.filter_by(name=data['name']).first()
        if existing_skill:
            return jsonify({'error': 'Skill already exists'}), 400
        
        skill = Skill(
            name=data['name'],
            category=data['category'],
            description=data.get('description', ''),
            icon=data.get('icon', 'star')
        )
        
        db.session.add(skill)
        db.session.commit()
        
        return jsonify(skill.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# User Skills Routes
@app.route('/api/users/<user_id>/skills', methods=['GET'])
def get_user_skills(user_id):
    user_skills = UserSkill.query.filter_by(user_id=user_id).all()
    return jsonify([user_skill.to_dict() for user_skill in user_skills]), 200

@app.route('/api/users/<user_id>/skills', methods=['POST'])
def add_user_skill(user_id):
    current_user_id = session.get('user_id')
    if not current_user_id or current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        
        if not data.get('skill_id'):
            return jsonify({'error': 'Skill ID is required'}), 400
        
        # Check if user skill already exists
        existing_user_skill = UserSkill.query.filter_by(
            user_id=user_id, 
            skill_id=data['skill_id']
        ).first()
        
        if existing_user_skill:
            return jsonify({'error': 'User already has this skill'}), 400
        
        user_skill = UserSkill(
            user_id=user_id,
            skill_id=data['skill_id'],
            proficiency_level=data.get('proficiency_level', 1),
            want_to_teach=data.get('want_to_teach', False),
            want_to_learn=data.get('want_to_learn', False),
            years_experience=data.get('years_experience', 0)
        )
        
        db.session.add(user_skill)
        db.session.commit()
        
        return jsonify(user_skill.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>/skills/<skill_id>', methods=['DELETE'])
def remove_user_skill(user_id, skill_id):
    current_user_id = session.get('user_id')
    if not current_user_id or current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        user_skill = UserSkill.query.filter_by(
            user_id=user_id, 
            skill_id=skill_id
        ).first()
        
        if not user_skill:
            return jsonify({'error': 'User skill not found'}), 404
        
        db.session.delete(user_skill)
        db.session.commit()
        
        return jsonify({'message': 'Skill removed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Skill Matching Routes
@app.route('/api/skill-matches/<user_id>', methods=['GET'])
def get_skill_matches(user_id):
    try:
        # Get user's skills
        user_skills = UserSkill.query.filter_by(user_id=user_id).all()
        
        if not user_skills:
            return jsonify([]), 200
        
        matches = []
        
        for user_skill in user_skills:
            if user_skill.want_to_learn:
                # Find users who want to teach this skill
                potential_teachers = UserSkill.query.filter(
                    and_(
                        UserSkill.skill_id == user_skill.skill_id,
                        UserSkill.want_to_teach == True,
                        UserSkill.user_id != user_id
                    )
                ).all()
                
                for teacher_skill in potential_teachers:
                    # Calculate match percentage based on proficiency difference and experience
                    proficiency_diff = abs(teacher_skill.proficiency_level - user_skill.proficiency_level)
                    experience_factor = min(teacher_skill.years_experience / 5, 1.0)  # Cap at 5 years
                    
                    # Higher match percentage for teachers with more experience and appropriate proficiency
                    match_percentage = max(0, 100 - (proficiency_diff * 10) + (experience_factor * 20))
                    
                    matches.append({
                        'user': teacher_skill.user.to_dict(),
                        'skill': teacher_skill.skill.to_dict(),
                        'match_percentage': round(match_percentage, 1),
                        'teacher_proficiency': teacher_skill.proficiency_level,
                        'teacher_experience': teacher_skill.years_experience,
                        'match_type': 'teacher'
                    })
            
            if user_skill.want_to_teach:
                # Find users who want to learn this skill
                potential_students = UserSkill.query.filter(
                    and_(
                        UserSkill.skill_id == user_skill.skill_id,
                        UserSkill.want_to_learn == True,
                        UserSkill.user_id != user_id
                    )
                ).all()
                
                for student_skill in potential_students:
                    proficiency_diff = abs(user_skill.proficiency_level - student_skill.proficiency_level)
                    
                    # Higher match percentage for students with lower proficiency (more to teach)
                    match_percentage = max(0, 100 - (proficiency_diff * 5))
                    
                    matches.append({
                        'user': student_skill.user.to_dict(),
                        'skill': student_skill.skill.to_dict(),
                        'match_percentage': round(match_percentage, 1),
                        'student_proficiency': student_skill.proficiency_level,
                        'match_type': 'student'
                    })
        
        # Sort by match percentage descending
        matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        return jsonify(matches), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/skill-matches/percentiles', methods=['GET'])
def get_skill_match_percentiles():
    try:
        # Calculate percentiles for all skills
        skills = Skill.query.all()
        percentiles = {}
        
        for skill in skills:
            user_skills = UserSkill.query.filter_by(skill_id=skill.id).all()
            
            if user_skills:
                proficiency_levels = [us.proficiency_level for us in user_skills]
                proficiency_levels.sort()
                
                percentiles[skill.name] = {
                    'skill_id': skill.id,
                    'total_users': len(user_skills),
                    'avg_proficiency': round(sum(proficiency_levels) / len(proficiency_levels), 1),
                    'percentiles': {
                        '25th': proficiency_levels[int(len(proficiency_levels) * 0.25)] if len(proficiency_levels) >= 4 else proficiency_levels[0],
                        '50th': proficiency_levels[int(len(proficiency_levels) * 0.5)] if len(proficiency_levels) >= 2 else proficiency_levels[0],
                        '75th': proficiency_levels[int(len(proficiency_levels) * 0.75)] if len(proficiency_levels) >= 4 else proficiency_levels[-1],
                        '90th': proficiency_levels[int(len(proficiency_levels) * 0.9)] if len(proficiency_levels) >= 10 else proficiency_levels[-1]
                    }
                }
        
        return jsonify(percentiles), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chat and Messaging Routes
@app.route('/api/messages/<room_id>', methods=['GET'])
def get_messages(room_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        messages = Message.query.filter_by(room_id=room_id)\
            .order_by(Message.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'messages': [message.to_dict() for message in reversed(messages.items)],
            'has_next': messages.has_next,
            'has_prev': messages.has_prev,
            'total': messages.total
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages', methods=['POST'])
def send_message():
    try:
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        
        if not data.get('room_id') or not data.get('content'):
            return jsonify({'error': 'Room ID and content are required'}), 400
        
        message = Message(
            sender_id=current_user_id,
            room_id=data['room_id'],
            content=data['content'],
            message_type=data.get('message_type', 'text')
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify(message.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Meeting Room Routes
@app.route('/api/meeting-rooms', methods=['GET'])
def get_meeting_rooms():
    rooms = MeetingRoom.query.filter_by(is_active=True).order_by(MeetingRoom.created_at.desc()).all()
    return jsonify([room.to_dict() for room in rooms]), 200

@app.route('/api/meeting-rooms', methods=['POST'])
def create_meeting_room():
    try:
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Room name is required'}), 400
        
        # Generate a mock Zoom meeting ID and URL (replace with actual Zoom SDK integration)
        zoom_meeting_id = f"bridgen-{uuid.uuid4().hex[:8]}"
        zoom_join_url = f"https://zoom.us/j/{zoom_meeting_id}"
        
        room = MeetingRoom(
            name=data['name'],
            description=data.get('description', ''),
            creator_id=current_user_id,
            zoom_meeting_id=zoom_meeting_id,
            zoom_join_url=zoom_join_url,
            scheduled_time=datetime.fromisoformat(data['scheduled_time']) if data.get('scheduled_time') else None,
            max_participants=data.get('max_participants', 10)
        )
        
        db.session.add(room)
        db.session.commit()
        
        return jsonify(room.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/meeting-rooms/<room_id>', methods=['GET'])
def get_meeting_room(room_id):
    room = MeetingRoom.query.get(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    
    return jsonify(room.to_dict()), 200

@app.route('/api/meeting-rooms/<room_id>/join', methods=['POST'])
def join_meeting_room(room_id):
    try:
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        room = MeetingRoom.query.get(room_id)
        if not room:
            return jsonify({'error': 'Room not found'}), 404
        
        if not room.is_active:
            return jsonify({'error': 'Room is not active'}), 400
        
        # In a real implementation, you would integrate with Zoom SDK here
        # For now, we'll just return the join URL
        return jsonify({
            'zoom_join_url': room.zoom_join_url,
            'meeting_id': room.zoom_meeting_id,
            'room': room.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Gamification Routes
@app.route('/api/users/<user_id>/points', methods=['POST'])
def add_points(user_id):
    try:
        current_user_id = session.get('user_id')
        if not current_user_id or current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.get_json()
        points = data.get('points', 0)
        
        if points <= 0:
            return jsonify({'error': 'Points must be positive'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.points += points
        
        # Calculate new level (every 100 points = 1 level)
        new_level = (user.points // 100) + 1
        level_up = new_level > user.level
        user.level = new_level
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'points': user.points,
            'level': user.level,
            'level_up': level_up,
            'points_to_next_level': 100 - (user.points % 100)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}), 200