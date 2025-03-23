from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.query import Query
from app.models.user import User
from app.services.ai_service import AIService
from datetime import datetime
from app.utils.decorators import json_required, patient_required, clinician_required
import random

bp = Blueprint('query', __name__)

@bp.route('', methods=['GET'])
@bp.route('/', methods=['GET'])
@login_required
def get_queries():
    """Get all queries for the current user."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if current_user.is_patient():
            # Get patient's queries
            queries = Query.query.filter_by(patient_id=current_user.id)\
                .order_by(Query.created_at.desc())\
                .paginate(page=page, per_page=per_page)
        else:
            # Get queries for clinician review
            queries = Query.query.filter_by(status='pending')\
                .order_by(Query.created_at.desc())\
                .paginate(page=page, per_page=per_page)
        
        return jsonify({
            'queries': [query.to_dict() for query in queries.items],
            'pages': queries.pages,
            'current_page': queries.page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
@bp.route('/', methods=['POST'])
@login_required
@patient_required
@json_required
def create_query():
    """Create a new query."""
    try:
        data = request.get_json()
        
        # Get AI response
        ai_service = AIService()
        category, ai_response = ai_service.get_response(data['question'])
        
        print(f"Category determined: {category}")  # Debug print
        
        # Find clinicians with matching specialization
        matching_clinicians = User.query.filter(
            User.role == 'clinician',
            User.specialization == category
        ).all()
        
        print(f"Matching clinicians found: {len(matching_clinicians)}")  # Debug print
        if matching_clinicians:
            print(f"First matching clinician: {matching_clinicians[0].to_dict()}")  # Debug print
        
        # If no matching clinicians, get all clinicians
        if not matching_clinicians:
            print("No matching specialists, getting all clinicians")  # Debug print
            matching_clinicians = User.query.filter_by(role='clinician').all()
            print(f"Total clinicians found: {len(matching_clinicians)}")  # Debug print
            if matching_clinicians:
                print(f"First available clinician: {matching_clinicians[0].to_dict()}")  # Debug print
        
        # If still no clinicians, return error
        if not matching_clinicians:
            print("No clinicians found at all!")  # Debug print
            return jsonify({'error': 'No clinicians available'}), 400
        
        # Select a random clinician
        assigned_clinician = random.choice(matching_clinicians) # Debug print
        
        # Validate clinician_id before creating query
        if not assigned_clinician or not assigned_clinician.id:
            print("Error: Invalid clinician selected")  # Debug print
            return jsonify({'error': 'Invalid clinician selected'}), 400
            
        print(f"Creating query with clinician_id: {assigned_clinician.id}")  # Debug print
        
        # Create new query with assigned clinician
        query = Query(
            patient_id=current_user.id,
            clinician_id=assigned_clinician.id,
            category=category,
            question=data['question'],
            is_anonymous=data.get('is_anonymous', False),
            urgency_level=data.get('urgency_level', 'low'),
            status='pending_review'
        )
        
        # Verify clinician_id was set correctly
        if not query.clinician_id:
            print("Error: clinician_id not set after query creation")  # Debug print
            return jsonify({'error': 'Failed to assign clinician'}), 500
            
        # Set AI response
        query.set_ai_response(ai_response)
        
        # Debug print before commit
        print(f"Query before commit - clinician_id: {query.clinician_id}, status: {query.status}")
        
        db.session.add(query)
        db.session.flush()  # Flush to get the ID without committing
        print(f"Query after flush - clinician_id: {query.clinician_id}, status: {query.status}")
        
        # Verify clinician_id before commit
        if not query.clinician_id:
            print("Error: clinician_id lost before commit")  # Debug print
            db.session.rollback()
            return jsonify({'error': 'Failed to persist clinician assignment'}), 500
            
        db.session.commit()
        
        # Debug print after commit
        print(f"Query after commit - clinician_id: {query.clinician_id}, status: {query.status}")
        
        return jsonify({
            'message': 'Query created successfully',
            'query': query.to_dict()
        }), 201
        
    except Exception as e:
        print(f"Error in create_query: {str(e)}")  # Debug print
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:query_id>/review', methods=['POST'])
@login_required
@clinician_required
@json_required
def review_query(query_id):
    """Review a query and provide clinician feedback."""
    try:
        data = request.get_json()
        query = Query.query.get_or_404(query_id)
        
        # Update query with clinician review
        query.clinician_response = data['response']
        query.status = 'verified'
        query.reviewed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Query reviewed successfully',
            'query': query.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/analytics', methods=['GET'])
@login_required
@clinician_required
def get_analytics():
    """Get analytics for queries."""
    try:
        # Get all queries
        queries = Query.query.all()
        
        # Calculate category statistics
        category_stats = {}
        for query in queries:
            category_stats[query.category] = category_stats.get(query.category, 0) + 1
        
        # Calculate average response time
        total_response_time = 0
        reviewed_queries = [q for q in queries if q.reviewed_at]
        if reviewed_queries:
            for query in reviewed_queries:
                response_time = (query.reviewed_at - query.created_at).total_seconds()
                total_response_time += response_time
            avg_response_time = total_response_time / len(reviewed_queries)
        else:
            avg_response_time = 0
        
        return jsonify({
            'category_stats': category_stats,
            'avg_response_time_seconds': avg_response_time
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 