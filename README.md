# Patient-Clinician Health Query Portal

A secure hospital-connected system that bridges the gap between patients and healthcare professionals through an AI-assisted query portal.

## Features

- **Secure Authentication System**
  - Role-based access for patients and clinicians
  - Secure login and registration
  - Dashboard customization based on user role

- **AI-Assisted Query System**
  - Instant AI-generated responses
  - Medical specialization categorization
  - Clinician verification workflow

- **User-Friendly Interface**
  - Accessible design for older adults
  - Voice-to-text input support
  - Clear navigation and large text options

- **Real-time Notifications**
  - Patient response verification alerts
  - Clinician review notifications
  - Query status updates

- **Data Analytics & Insights**
  - Query tracking and analysis
  - Patient concern analytics
  - Healthcare trend monitoring

## Technical Stack

- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: Flask-Login
- **Migration**: Flask-Migrate


## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd patient_portal
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

**With Docker (Recommended)**

Ensure Docker and Docker Compose are installed.

Navigate to the project directory:
```bash
cd patient_portal
```
Start the entire system (Backend, Database, Frontend) using:
```bash
docker-compose up --build
```
Once the containers are running, access the app at:
```bash
http://localhost:5000  # Backend API
http://localhost:3000  # Frontend (if applicable)
```
To stop the containers, use:
```bash
docker-compose down  
```

5. Configuration Settings:
   The application uses different configurations for development, testing, and production:

   - **Development** (default):
     ```python
     SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:postgres@localhost:5431/patient_clinic_dev'
     DEBUG = True
     ```

   - **Testing**:
     ```python
     SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:postgres@localhost:5431/patient_clinic_test'
     TESTING = True
     ```

   - **Production**:
     ```python
     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
     DEBUG = False
     ```

   Additional settings include:
   - AI service configuration

6. Initialize the database:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

7. Run the application:
   ```bash
   flask run
   ```

## Project Structure

```
patient-clinic/
├── app/                    # Application package
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── config/                # Configuration files
├── migrations/            # Database migrations
├── tests/                 # Test suite
└── run.py                # Application entry point
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout

### Patient Endpoints

- `POST /api/queries`: Submit new health query
- `GET /api/queries`: Get user's queries
- `GET /api/queries/<id>`: Get specific query details

### Clinician Endpoints

- `GET /api/reviews`: Get pending reviews
- `PUT /api/queries/<id>/verify`: Verify/edit AI response
- `GET /api/analytics`: Get query analytics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

For security concerns, please email security@example.com 
