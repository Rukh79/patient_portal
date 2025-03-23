from functools import wraps
from flask import request, jsonify
from flask_login import current_user

def json_required(f):
    """Ensure request has JSON content type."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 415
        return f(*args, **kwargs)
    return decorated_function

def patient_required(f):
    """Ensure user is a patient."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_patient():
            return jsonify({'error': 'Access denied. Patient role required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def clinician_required(f):
    """Ensure user is a verified clinician."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_clinician():
            return jsonify({'error': 'Access denied. Clinician role required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Ensure user is an admin."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.role == 'admin':
            return jsonify({'error': 'Access denied. Admin role required.'}), 403
        return f(*args, **kwargs)
    return decorated_function

def rate_limit(limit=100, per=60):
    """
    Rate limit decorator.
    :param limit: Number of allowed requests
    :param per: Time period in seconds
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # This is a placeholder for rate limiting logic
            # In production, use Redis or similar for proper rate limiting
            return f(*args, **kwargs)
        return decorated_function
    return decorator 