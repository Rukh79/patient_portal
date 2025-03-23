import re
from email_validator import validate_email as validate_email_format, EmailNotValidError

def validate_email(email):
    """Validate email format."""
    try:
        validate_email_format(email)
        return True
    except EmailNotValidError:
        return False

def validate_password(password):
    """
    Validate password strength.
    Requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one number
    """
    if len(password) < 8:
        return False
    
    if not re.search(r'[A-Z]', password):
        return False
    
    if not re.search(r'[a-z]', password):
        return False
    
    if not re.search(r'\d', password):
        return False
    
    return True

def validate_license_number(license_number):
    """
    Validate clinician license number format.
    Format: XXX-XXXXXXX (3 letters followed by 7 digits)
    """
    pattern = r'^[A-Z]{3}-\d{7}$'
    return bool(re.match(pattern, license_number))

def sanitize_input(text):
    """
    Sanitize user input to prevent XSS attacks.
    Remove HTML tags and special characters.
    """
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    return text.strip()

def validate_category(category):
    """
    Validate medical category.
    """
    valid_categories = {
        'general',
        'cardiology',
        'dermatology',
        'endocrinology',
        'gastroenterology',
        'neurology',
        'oncology',
        'pediatrics',
        'psychiatry',
        'pulmonology',
        'rheumatology'
    }
    return category.lower() in valid_categories 