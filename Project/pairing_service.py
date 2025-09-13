#!/usr/bin/env python3
"""
Skill Matching Service
Integrates the pairing algorithm with the frontend database
"""

import sqlite3
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from typing import Dict, List, Tuple, Any

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def fetch_users_from_db():
    """Fetch all users and their skills from the database"""
    try:
        # Read from the actual SQLite in-memory database created by the Node.js server
        # We'll use the same database structure but with a direct connection
        
        # Sample data that matches our database structure
        # In production, this would read from the actual database
        users_data = [
            {
                'id': 'user1', 'username': 'Alice_Teacher', 'age_group': 'Elder',
                'skills_teach': ['Coding', 'Web Development'], 
                'skills_learn': ['Cooking'],
                'want_tutoring': True,
                'email': 'alice@example.com'
            },
            {
                'id': 'user2', 'username': 'Bob_Student', 'age_group': 'Youth',
                'skills_teach': ['Photography'], 
                'skills_learn': ['Coding', 'Music (Playing Instrument)'],
                'want_tutoring': False,
                'email': 'bob@example.com'
            },
            {
                'id': 'user3', 'username': 'Charlie_Expert', 'age_group': 'Elder',
                'skills_teach': ['Writing', 'Music (Playing Instrument)'], 
                'skills_learn': ['Coding'],
                'want_tutoring': True,
                'email': 'charlie@example.com'
            },
            {
                'id': 'user4', 'username': 'Diana_Learner', 'age_group': 'Youth',
                'skills_teach': ['Cooking', 'Gardening'], 
                'skills_learn': ['Coding', 'Financial Literacy'],
                'want_tutoring': False,
                'email': 'diana@example.com'
            },
            {
                'id': 'user5', 'username': 'Edward_Mentor', 'age_group': 'Elder',
                'skills_teach': ['Coding', 'Web Development', 'Mentoring'], 
                'skills_learn': ['Woodworking'],
                'want_tutoring': True,
                'email': 'edward@example.com'
            }
        ]
        return users_data
    except Exception as e:
        print(f"Database error: {e}")
        return []

def get_user_data_from_frontend():
    """
    This function will be called by the frontend to get real user data
    In production, this would query the actual database
    """
    import requests
    
    try:
        # Try to fetch data from the Node.js server
        response = requests.get('http://localhost:5000/api/users')
        if response.status_code == 200:
            users = response.json()
            # Transform the data to match our algorithm format
            formatted_users = []
            for user in users:
                # Determine age group (you might want to add an age field to users table)
                age_group = 'Youth' if user.get('level', 1) < 5 else 'Elder'
                
                # Extract skills from user_skills data
                skills_teach = []
                skills_learn = []
                
                for skill_data in user.get('skills', []):
                    skill_name = skill_data['skill']['name']
                    if skill_data['want_to_teach']:
                        skills_teach.append(skill_name)
                    if skill_data['want_to_learn']:
                        skills_learn.append(skill_name)
                
                formatted_users.append({
                    'id': user['id'],
                    'username': user['username'],
                    'age_group': age_group,
                    'skills_teach': skills_teach,
                    'skills_learn': skills_learn,
                    'want_tutoring': len([s for s in user.get('skills', []) if 'Academics' in s['skill']['name']]) > 0,
                    'email': user.get('email', '')
                })
            
            return formatted_users
    except:
        pass
    
    # Fallback to sample data
    return fetch_users_from_db()

def calculate_compatibility_score(person: Dict, potential_match: Dict, is_youth: bool, wants_tutoring: bool = False) -> Tuple[int, List[str]]:
    """
    Calculate compatibility score between two people
    Adapted from the original similarities() function
    """
    points = 0
    shared_interests = []
    
    if is_youth:
        # Youth person teaching to elder person learning
        for skill in person['skills_teach']:
            if skill in potential_match['skills_learn']:
                points += 1
                shared_interests.append(f"You teach {skill}")
        
        # Youth person learning from elder person teaching  
        for skill in person['skills_learn']:
            if skill in potential_match['skills_teach']:
                points += 1
                shared_interests.append(f"You learn {skill}")
                
        # Tutoring bonus for academic subjects
        if wants_tutoring:
            academic_skills = ['Mathematics', 'Science', 'History', 'Literature', 'Academics (General)']
            for skill in person['skills_learn']:
                if skill in academic_skills and skill in potential_match['skills_teach']:
                    points += 1
                    shared_interests.append(f"Academic tutoring: {skill}")
    else:
        # Elder person teaching to youth person learning
        for skill in person['skills_teach']:
            if skill in potential_match['skills_learn']:
                points += 1
                shared_interests.append(f"You teach {skill}")
        
        # Elder person learning from youth person teaching
        for skill in person['skills_learn']:
            if skill in potential_match['skills_teach']:
                points += 1
                shared_interests.append(f"You learn {skill}")
                
        # Tutoring bonus
        if wants_tutoring:
            academic_skills = ['Mathematics', 'Science', 'History', 'Literature', 'Academics (General)']
            for skill in person['skills_teach']:
                if skill in academic_skills and skill in potential_match['skills_learn']:
                    points += 1
                    shared_interests.append(f"Academic tutoring: {skill}")
    
    return points, shared_interests

def score_all_matches(youth_users: List[Dict], elder_users: List[Dict]) -> Tuple[Dict, Dict]:
    """
    Score all possible matches between youth and elder users
    Adapted from the original score() function
    """
    all_scored = {}
    all_match_interests = {}
    
    # Score youth users against elder users
    for person in youth_users:
        person_scores = {}
        person_interests = {}
        
        for potential_match in elder_users:
            score, interests = calculate_compatibility_score(
                person, potential_match, is_youth=True, 
                wants_tutoring=person.get('want_tutoring', False)
            )
            person_scores[potential_match['username']] = score
            person_interests[potential_match['username']] = interests
        
        all_scored[person['username']] = person_scores
        all_match_interests[person['username']] = person_interests
    
    # Score elder users against youth users  
    for person in elder_users:
        person_scores = {}
        person_interests = {}
        
        for potential_match in youth_users:
            score, interests = calculate_compatibility_score(
                person, potential_match, is_youth=False,
                wants_tutoring=person.get('want_tutoring', False)
            )
            person_scores[potential_match['username']] = score
            person_interests[potential_match['username']] = interests
        
        all_scored[person['username']] = person_scores
        all_match_interests[person['username']] = person_interests
    
    return all_scored, all_match_interests

def rank_preferences(scored_matches: Dict) -> Dict:
    """
    Rank preferences for each person based on compatibility scores
    Adapted from the original rank() function
    """
    ranked = {}
    for person, scores in scored_matches.items():
        # Sort by score (descending) and create preference list
        sorted_matches = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        ranked[person] = [match[0] for match in sorted_matches if match[1] > 0]  # Only include positive scores
    return ranked

def stable_matching(youth_preferences: Dict, elder_preferences: Dict) -> Dict:
    """
    Implement stable matching algorithm (Gale-Shapley)
    Adapted from the original pairing() function
    """
    youth_free = list(youth_preferences.keys())
    elder_free = list(elder_preferences.keys())
    pairs = {}
    
    while len(youth_free) > 0 and len(elder_free) > 0:
        youth = youth_free.pop(0)
        
        for elder in youth_preferences[youth]:
            if elder in elder_free:
                # Elder is free, pair them
                pairs[youth] = elder
                elder_free.remove(elder)
                break
            else:
                # Elder is already paired, check if they prefer this youth
                current_youth = None
                for y, e in pairs.items():
                    if e == elder:
                        current_youth = y
                        break
                
                if current_youth and elder in elder_preferences:
                    youth_index = elder_preferences[elder].index(youth) if youth in elder_preferences[elder] else float('inf')
                    current_index = elder_preferences[elder].index(current_youth) if current_youth in elder_preferences[elder] else float('inf')
                    
                    if youth_index < current_index:
                        # Elder prefers new youth, swap
                        pairs[youth] = elder
                        del pairs[current_youth]
                        youth_free.append(current_youth)
                        break
    
    return pairs

@app.route('/api/skill-swap/<user_id>', methods=['POST'])
def find_skill_swap_match(user_id):
    """
    Find the best skill swap match for a given user
    """
    try:
        # Fetch all users and their skills from frontend
        all_users = get_user_data_from_frontend()
        
        # Find the requesting user
        requesting_user = None
        for user in all_users:
            if user['id'] == user_id:
                requesting_user = user
                break
        
        if not requesting_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Separate youth and elder users
        youth_users = [u for u in all_users if u['age_group'] == 'Youth']
        elder_users = [u for u in all_users if u['age_group'] == 'Elder']
        
        # Score all potential matches
        all_scored, all_interests = score_all_matches(youth_users, elder_users)
        
        # Get the requesting user's scores
        user_scores = all_scored.get(requesting_user['username'], {})
        user_interests = all_interests.get(requesting_user['username'], {})
        
        if not user_scores:
            return jsonify({
                'message': 'No compatible matches found',
                'matches': []
            })
        
        # Sort matches by compatibility score
        sorted_matches = sorted(user_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Format response with top matches
        top_matches = []
        for match_name, score in sorted_matches[:5]:  # Top 5 matches
            if score > 0:
                # Find the full user data for this match
                match_user = None
                for user in all_users:
                    if user['username'] == match_name:
                        match_user = user
                        break
                
                if match_user:
                    top_matches.append({
                        'user': match_user,
                        'compatibility_score': score,
                        'shared_interests': user_interests.get(match_name, []),
                        'match_percentage': min(100, (score / 5) * 100)  # Convert to percentage
                    })
        
        return jsonify({
            'requesting_user': requesting_user,
            'matches': top_matches,
            'total_potential_matches': len([s for s in user_scores.values() if s > 0])
        })
        
    except Exception as e:
        print(f"Error in skill swap matching: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/skill-swap/full-matching', methods=['POST'])
def run_full_matching():
    """
    Run the complete stable matching algorithm for all users
    """
    try:
        all_users = get_user_data_from_frontend()
        
        # Separate youth and elder users
        youth_users = [u for u in all_users if u['age_group'] == 'Youth']
        elder_users = [u for u in all_users if u['age_group'] == 'Elder']
        
        # Score all matches
        all_scored, all_interests = score_all_matches(youth_users, elder_users)
        
        # Rank preferences
        all_ranked = rank_preferences(all_scored)
        
        # Separate youth and elder preferences
        youth_preferences = {k: v for k, v in all_ranked.items() if any(u['username'] == k and u['age_group'] == 'Youth' for u in all_users)}
        elder_preferences = {k: v for k, v in all_ranked.items() if any(u['username'] == k and u['age_group'] == 'Elder' for u in all_users)}
        
        # Run stable matching
        final_pairs = stable_matching(youth_preferences, elder_preferences)
        
        # Format results
        formatted_pairs = []
        for youth, elder in final_pairs.items():
            youth_data = next((u for u in all_users if u['username'] == youth), None)
            elder_data = next((u for u in all_users if u['username'] == elder), None)
            
            if youth_data and elder_data:
                compatibility_score = all_scored.get(youth, {}).get(elder, 0)
                shared_interests = all_interests.get(youth, {}).get(elder, [])
                
                formatted_pairs.append({
                    'youth': youth_data,
                    'elder': elder_data,
                    'compatibility_score': compatibility_score,
                    'shared_interests': shared_interests
                })
        
        return jsonify({
            'pairs': formatted_pairs,
            'total_users': len(all_users),
            'youth_count': len(youth_users),
            'elder_count': len(elder_users),
            'successful_matches': len(formatted_pairs)
        })
        
    except Exception as e:
        print(f"Error in full matching: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'pairing_service'})

if __name__ == '__main__':
    print("🚀 Starting Skill Matching Service...")
    print("📊 Pairing algorithm ready for frontend integration")
    app.run(host='127.0.0.1', port=5001, debug=True)
