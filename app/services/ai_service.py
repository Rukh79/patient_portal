from flask import current_app
from app.utils.specialization import Specialization
from google import genai
from typing import Tuple
import logging

# Add logger
logger = logging.getLogger(__name__)

class AIService:
    """Service for handling AI-generated responses."""
    
    def __init__(self):
        # Get API key from environment variables for security rather than hardcoding
        self.api_key = current_app.config.get('GEMINI_API_KEY')
        self.model = current_app.config.get('GEMINI_MODEL', 'gemini-2.0-flash')
        self.valid_categories = Specialization.list()
        
        # Initialize the genai client
        self.client = genai.Client(api_key=self.api_key)
    
    def get_response(self, query: str) -> Tuple[str, str]:
        """Get AI response for a health query"""
        try:
            # First determine the category
            category = self._determine_category(query)
            
            # Prepare the prompt with the determined category
            prompt = f"""You are a medical AI assistant. Please provide a detailed medical response to the following health query. Format your response exactly as shown, starting with the category:

Query: {query}

# Category
{category}

# Overview
[Provide a brief summary of the main points]

# Detailed Analysis

Key symptoms and their significance:
- [Symptom 1 and its significance]
- [Symptom 2 and its significance]
- [Symptom 3 and its significance]

Potential causes and risk factors:
- [Cause/factor 1]
- [Cause/factor 2]
- [Cause/factor 3]

Relevant medical conditions:
- [Condition 1]
- [Condition 2]
- [Condition 3]

# Clinical Considerations

When to seek immediate medical attention:
- [Emergency situation 1]
- [Emergency situation 2]
- [Emergency situation 3]

Warning signs to watch for:
- [Warning sign 1]
- [Warning sign 2]
- [Warning sign 3]

Risk factors to be aware of:
- [Risk factor 1]
- [Risk factor 2]
- [Risk factor 3]

# Important Notes

Key points to remember:
- [Key point 1]
- [Key point 2]
- [Key point 3]

Lifestyle considerations:
- [Lifestyle point 1]
- [Lifestyle point 2]
- [Lifestyle point 3]

Preventive measures:
- [Measure 1]
- [Measure 2]
- [Measure 3]

# Next Steps

Immediate actions:
- [Action 1]
- [Action 2]
- [Action 3]

Follow-up recommendations:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

Self-care measures:
- [Measure 1]
- [Measure 2]
- [Measure 3]

Please ensure your response:
1. Follows this exact format with proper markdown
2. Includes the category section at the top
3. Uses proper line breaks between sections
4. Uses proper list formatting with dashes
5. Is professional and medically accurate
6. Is clear and easy to understand
7. Is based on current medical knowledge
8. Is appropriate for the query's urgency level
9. Does not include any disclaimers"""

            # Get response from Gemini
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            
            # Extract the response text and ensure proper markdown formatting
            ai_response = response.text.strip()
            
            # Process the markdown to ensure proper formatting
            lines = ai_response.split('\n')
            formatted_lines = []
            
            for i, line in enumerate(lines):
                # Add double line breaks before headers
                if line.startswith('#'):
                    if i > 0:  # Don't add newline before the first header
                        formatted_lines.extend(['', ''])
                    formatted_lines.append(line)
                # Add proper spacing for list items
                elif line.strip().startswith('-'):
                    if i > 0 and not lines[i-1].strip().startswith('-'):
                        formatted_lines.append('')
                    formatted_lines.append(line)
                # Handle normal lines
                else:
                    formatted_lines.append(line)
            
            # Join the lines back together
            ai_response = '\n'.join(formatted_lines)
            
            # Verify category is included
            if '# Category' not in ai_response:
                ai_response = f"# Category\n{category}\n\n{ai_response}"
            
            return category, ai_response
            
        except Exception as e:
            logger.error(f"Error getting AI response: {str(e)}")
            raise AIServiceError(f"Failed to get AI response: {str(e)}")
    
    def _determine_category(self, query: str) -> str:
        """Determine the medical specialization category based on the query content."""
        try:
            # Create a prompt for categorization
            categorization_prompt = f"""Given the following medical query, determine the most appropriate medical specialization category from this list: {', '.join(self.valid_categories)}.

Query: {query}

Please respond with ONLY the name of the most appropriate specialization category from the list provided. Don't include any explanations or additional text."""

            # Get categorization from Gemini using the correct client method
            category_response = self.client.models.generate_content(
                model=self.model,
                contents=categorization_prompt
            )
            
            # Extract and validate the category
            suggested_category = category_response.text.strip()
            
            # Ensure the category is valid (case-insensitive comparison)
            for valid_category in self.valid_categories:
                if valid_category.lower() == suggested_category.lower():
                    return valid_category
            
            # Default to General Medicine if no match is found
            logger.warning(f"Category '{suggested_category}' not found in valid categories. Defaulting to 'General Medicine'.")
            return "General Medicine"
            
        except Exception as e:
            logger.error(f"Error determining category: {str(e)}")
            return "General Medicine"  # Default category on error

class AIServiceError(Exception):
    """Custom exception for AI service errors."""
    pass