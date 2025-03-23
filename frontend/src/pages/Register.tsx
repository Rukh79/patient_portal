import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { api } from '../services/api';
import { validateEmail, validatePassword } from '../utils/validation';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 1,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  width: '100%',
  maxWidth: '600px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  margin: '0 auto',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: '32px',
    color: '#fff',
  },
}));

// Add specializations array
const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Psychiatry",
  "Orthopedics",
  "Gynecology",
  "Oncology",
  "Endocrinology",
  "Gastroenterology",
  "Pulmonology",
  "Nephrology",
  "Urology",
  "Ophthalmology",
  "Ear, Nose & Throat",
  "Rheumatology",
  "Hematology",
  "Infectious Disease",
  "Allergy & Immunology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "General Surgery",
  "Plastic Surgery"
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'patient' | 'clinician';
    specialization: string;
    license_number: string;
  }>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'patient',
    specialization: '',
    license_number: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    specialization?: string;
    license_number?: string;
  }>({});

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation errors when user types
    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation errors when user types
    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
      }
    }

    if (!formData.first_name) {
      errors.first_name = 'First name is required';
    }

    if (!formData.last_name) {
      errors.last_name = 'Last name is required';
    }

    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    if (formData.role === 'clinician') {
      if (!formData.specialization) {
        errors.specialization = 'Specialization is required for clinicians';
      }
      if (!formData.license_number) {
        errors.license_number = 'License number is required for clinicians';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Container component="main" maxWidth={false} sx={{ display: 'flex', justifyContent: 'center' }}>
        <StyledPaper elevation={3}>
          <LogoContainer>
            <MedicalServicesIcon />
          </LogoContainer>
          
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 1, 
              color: 'white',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            Create Account
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
            }}
          >
            Join our healthcare platform
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.2)',
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleTextChange}
                  error={!!validationErrors.first_name}
                  helperText={validationErrors.first_name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      color: 'white',
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f44336',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleTextChange}
                  error={!!validationErrors.last_name}
                  helperText={validationErrors.last_name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      color: 'white',
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f44336',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      color: 'white',
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f44336',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleTextChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                      color: 'white',
                      borderRadius: '8px',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: 'primary.main',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f44336',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!validationErrors.role}>
                  <InputLabel id="role-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleSelectChange}
                    sx={{
                      color: 'white',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="clinician">Clinician</MenuItem>
                  </Select>
                  {validationErrors.role && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {validationErrors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              {formData.role === 'clinician' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth required error={!!validationErrors.specialization}>
                      <InputLabel id="specialization-label" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Specialization
                      </InputLabel>
                      <Select
                        labelId="specialization-label"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        label="Specialization"
                        onChange={handleSelectChange}
                        sx={{
                          color: 'white',
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        {SPECIALIZATIONS.map((spec) => (
                          <MenuItem key={spec} value={spec}>
                            {spec}
                          </MenuItem>
                        ))}
                      </Select>
                      {validationErrors.specialization && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                          {validationErrors.specialization}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="license_number"
                      label="License Number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleTextChange}
                      error={!!validationErrors.license_number}
                      helperText={validationErrors.license_number}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                          color: 'white',
                          borderRadius: '8px',
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-focused': {
                            color: 'primary.main',
                          },
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#f44336',
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: 'primary.main',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Already have an account?{' '}
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'primary.main',
                    textTransform: 'none',
                    '&:hover': {
                      color: 'primary.light',
                    },
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </PageContainer>
  );
};

export default Register; 