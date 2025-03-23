from enum import Enum

class Specialization(str, Enum):
    CARDIOLOGY = "Cardiology"
    DERMATOLOGY = "Dermatology"
    NEUROLOGY = "Neurology"
    PEDIATRICS = "Pediatrics"
    PSYCHIATRY = "Psychiatry"
    ORTHOPEDICS = "Orthopedics"
    GYNECOLOGY = "Gynecology"
    ONCOLOGY = "Oncology"
    ENDOCRINOLOGY = "Endocrinology"
    GASTROENTEROLOGY = "Gastroenterology"
    PULMONOLOGY = "Pulmonology"
    NEPHROLOGY = "Nephrology"
    UROLOGY = "Urology"
    OPHTHALMOLOGY = "Ophthalmology"
    ENT = "Ear, Nose & Throat"
    RHEUMATOLOGY = "Rheumatology"
    HEMATOLOGY = "Hematology"
    INFECTIOUS_DISEASE = "Infectious Disease"
    ALLERGY_IMMUNOLOGY = "Allergy & Immunology"
    EMERGENCY_MEDICINE = "Emergency Medicine"
    FAMILY_MEDICINE = "Family Medicine"
    INTERNAL_MEDICINE = "Internal Medicine"
    GENERAL_SURGERY = "General Surgery"
    PLASTIC_SURGERY = "Plastic Surgery"
    
    @classmethod
    def list(cls):
        return [spec.value for spec in cls]