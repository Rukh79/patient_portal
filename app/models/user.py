from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(UserMixin, db.Model):
    """User model for both patients and clinicians."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'patient' or 'clinician'
    specialization = db.Column(db.String(100))  # For clinicians only
    license_number = db.Column(db.String(50))  # For clinicians only
    is_verified = db.Column(db.Boolean, default=False)  # For clinicians only
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    queries = db.relationship('Query', backref='author', lazy='dynamic',
                            foreign_keys='Query.patient_id')
    reviews = db.relationship('Query', backref='reviewer', lazy='dynamic',
                            foreign_keys='Query.clinician_id')
    
    def __init__(self, email, password, first_name, last_name, role):
        self.email = email
        self.set_password(password)
        self.first_name = first_name
        self.last_name = last_name
        self.role = role
    
    def set_password(self, password):
        """Set password hash."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password hash."""
        return check_password_hash(self.password_hash, password)
    
    def is_clinician(self):
        """Check if user is a clinician."""
        return self.role == 'clinician'
    
    def is_patient(self):
        """Check if user is a patient."""
        return self.role == 'patient'
    
    def to_dict(self):
        """Convert user to dictionary."""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'specialization': self.specialization,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.email}>' 