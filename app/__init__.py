from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import config

# Initialize Flask extensions
db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
migrate = Migrate()

def create_app(config_name='default'):
    """Application factory function."""
    
    # Create Flask app instance
    app = Flask(__name__)
    
    # Load config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    CORS(app, supports_credentials=True)
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.query import bp as query_bp
    from app.routes.clinician import bp as clinician_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(query_bp, url_prefix='/api/queries')
    app.register_blueprint(clinician_bp, url_prefix='/api/clinician')
    
    # Check database connection and create tables
    with app.app_context():
        try:
            db.engine.connect()
            print("Database connection successful!")
            db.create_all()
        except Exception as e:
            print(f"Database connection failed! Error: {e}")
            raise e
    
    return app

@login_manager.user_loader
def load_user(user_id):
    from app.models.user import User
    return User.query.get(int(user_id))