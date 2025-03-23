from datetime import datetime
from app import db

class Query(db.Model):
    """Model for health queries and responses."""
    
    __tablename__ = 'queries'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    clinician_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    category = db.Column(db.String(100), nullable=False)
    question = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text)
    clinician_response = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending, reviewed, verified
    urgency_level = db.Column(db.String(20), default='normal')  # low, normal, high
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    
    def __init__(self, patient_id, category, question, clinician_id=None, is_anonymous=False, urgency_level='normal', status='pending'):
        self.patient_id = patient_id
        self.category = category
        self.question = question
        self.is_anonymous = is_anonymous
        self.urgency_level = urgency_level
        self.status = status
        # Ensure clinician_id is properly set
        if clinician_id is not None:
            self.clinician_id = clinician_id
        else:
            self.clinician_id = None
    
    def set_ai_response(self, response):
        """Set AI-generated response."""
        self.ai_response = response
        self.status = 'pending'
        # Ensure clinician_id is not lost
        if not hasattr(self, 'clinician_id'):
            self.clinician_id = None
    
    def set_clinician_review(self, clinician_id, response):
        """Set clinician's review and response."""
        self.clinician_id = clinician_id
        self.clinician_response = response
        self.status = 'verified'
        self.reviewed_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert query to dictionary."""
        # Define status styles
        status_styles = {
            'pending': {'color': '#FFA500', 'background': '#FFF3E0'},  # Orange
            'reviewed': {'color': '#4CAF50', 'background': '#E8F5E9'},  # Green
            'verified': {'color': '#2196F3', 'background': '#E3F2FD'}   # Blue
        }

        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'clinician_id': self.clinician_id,
            'category': self.category,
            'question': self.question,
            'ai_response': self.ai_response,
            'clinician_response': self.clinician_response,
            'status': self.status,
            'status_style': status_styles.get(self.status, {}),  # Get style for current status
            'urgency_level': self.urgency_level,
            'is_anonymous': self.is_anonymous,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None
        }
    
    def __repr__(self):
        return f'<Query {self.id}>' 