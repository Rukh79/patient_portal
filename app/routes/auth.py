from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password
from app.utils.decorators import json_required
from app.utils.specialization import Specialization

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@json_required
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate email format
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Validate role
    if data['role'] not in ['patient', 'clinician']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        password=data['password'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role']
    )
    
    # Add clinician-specific fields
    if user.is_clinician():
        if 'specialization' not in data:
            return jsonify({'error': 'Clinician registration requires specialization'}), 400
        if 'license_number' not in data:
            return jsonify({'error': 'Clinician registration requires license number'}), 400
        
        # Validate specialization is one of the allowed values
        if data['specialization'] not in Specialization.list():
            return jsonify({'error': 'Invalid specialization. Must be one of: ' + ', '.join(Specialization.list())}), 400
            
        user.specialization = data['specialization']
        user.license_number = data['license_number']
    
    # Save user to database
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error occurred'}), 500
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
@json_required
def login():
    """Login user."""
    data = request.get_json()
    
    # Validate required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    # Login user
    login_user(user, remember=data.get('remember', False))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'role': user.role,
        'redirect': f'/{user.role}/dashboard'
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout user."""
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200 