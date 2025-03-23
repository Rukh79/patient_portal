from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.query import Query
from app.models.user import User
from app.utils.decorators import clinician_required, json_required

bp = Blueprint('clinician', __name__)

@bp.route('/api/clinician/profile', methods=['GET'])
@login_required
@clinician_required
def get_profile():
    """Get clinician profile."""
    try:
        return jsonify({
            'message': 'Profile retrieved successfully',
            'profile': current_user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/clinician/profile', methods=['PUT'])
@login_required
@clinician_required
@json_required
def update_profile():
    """Update clinician profile."""
    try:
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            current_user.first_name = data['first_name']
        if 'last_name' in data:
            current_user.last_name = data['last_name']
        if 'specialization' in data:
            current_user.specialization = data['specialization']
        if 'license_number' in data:
            current_user.license_number = data['license_number']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/api/clinician/stats', methods=['GET'])
@login_required
@clinician_required
def get_stats():
    """Get clinician statistics."""
    try:
        # Get total queries reviewed
        total_reviewed = Query.query.filter_by(
            clinician_id=current_user.id,
            status='reviewed'
        ).count()
        
        # Get pending reviews
        pending_reviews = Query.query.filter_by(
            status='pending'
        ).count()
        
        # Get average response time
        reviewed_queries = Query.query.filter_by(
            clinician_id=current_user.id,
            status='reviewed'
        ).all()
        
        total_response_time = 0
        if reviewed_queries:
            for query in reviewed_queries:
                response_time = (query.reviewed_at - query.created_at).total_seconds()
                total_response_time += response_time
            avg_response_time = total_response_time / len(reviewed_queries)
        else:
            avg_response_time = 0
        
        return jsonify({
            'total_reviewed': total_reviewed,
            'pending_reviews': pending_reviews,
            'avg_response_time_seconds': avg_response_time
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 