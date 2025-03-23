import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { LogoutRounded as LogoutIcon } from '@mui/icons-material';
import { api, Query, QueryResponse } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '1000px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(18, 18, 18, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}));

const QueryForm = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const QueryCard = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  height: '24px',
  fontSize: '0.75rem',
  fontWeight: 600,
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
}));

const MarkdownContent = styled(Box)(({ theme }) => ({
  '& h1': {
    fontSize: '1.8rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  '& h2': {
    fontSize: '1.4rem',
    fontWeight: 500,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  '& p': {
    marginBottom: theme.spacing(2),
    lineHeight: 1.6,
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: '4px',
    padding: theme.spacing(2),
  },
  '& hr': {
    margin: theme.spacing(3, 0),
    border: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  '& em': {
    fontStyle: 'italic',
  },
  '& strong': {
    fontWeight: 600,
  },
  '& code': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: '2px 4px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
}));

const PatientDashboard = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [newQuery, setNewQuery] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'normal' | 'high'>('normal');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchQueries = async () => {
    try {
      const response = await api.get<QueryResponse>(`api/queries?page=${page}&per_page=5`);
      setQueries(response.queries);
      setTotalPages(response.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;

    setSubmitting(true);
    try {
      await api.post<Query>('api/queries', {
        question: newQuery,
        is_anonymous: false,
        urgency_level: urgencyLevel,
      });

      setNewQuery('');
      setUrgencyLevel('normal');
      setShowForm(false);
      fetchQueries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create query');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQueryClick = (query: Query) => {
    setSelectedQuery(query);
    setOpenDialog(true);
  };

  const getStatusColor = (status: Query['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'pending_review':
        return 'info';
      case 'verified':
        return 'success';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency: Query['urgency_level']) => {
    switch (urgency) {
      case 'high':
        return 'error';
      case 'normal':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('api/auth/logout');
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <CircularProgress sx={{ color: 'white' }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <StyledPaper>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MedicalServicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 600 }}>
              Patient Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchQueries} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(!showForm)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
              }}
            >
              New Query
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {showForm && (
          <QueryForm>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Submit New Health Query
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Health Query"
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    placeholder="Describe your health concern..."
                    disabled={submitting}
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
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={!newQuery.trim() || submitting}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      {submitting ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CircularProgress size={20} color="inherit" />
                          Submitting...
                        </Box>
                      ) : (
                        'Submit Query'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </QueryForm>
        )}

        {queries.length > 0 ? (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mb={2}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Your Health Queries
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                  Next
                </Button>
              </Box>
            </Box>

            <List sx={{ width: '100%' }}>
              {queries.map((query, index) => (
                <React.Fragment key={query.id}>
                  <ListItem
                    component="div"
                    onClick={() => handleQueryClick(query)}
                    sx={{
                      mb: 1,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                          {query.question}
                        </Typography>
                      }
                      secondary={
                        <Box display="flex" gap={1} mt={1}>
                          <Chip
                            label={query.status}
                            color={getStatusColor(query.status)}
                            size="small"
                          />
                          <Chip
                            label={query.urgency_level}
                            color={getUrgencyColor(query.urgency_level)}
                            size="small"
                          />
                          <Chip
                            label={query.category}
                            variant="outlined"
                            size="small"
                            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {new Date(query.created_at).toLocaleDateString()}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < queries.length - 1 && <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />}
                </React.Fragment>
              ))}
            </List>
          </>
        ) : (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={4}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              No Health Queries Yet
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
              Click "New Query" to submit your first health query
            </Typography>
          </Box>
        )}
      </StyledPaper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: '16px',
          },
        }}
      >
        {selectedQuery && (
          <>
            <DialogTitle>Query Details</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                Question
              </Typography>
              <Typography paragraph>{selectedQuery.question}</Typography>

              <Typography variant="h6" gutterBottom>
                AI Response
              </Typography>
              <MarkdownContent>
                <ReactMarkdown>{selectedQuery.ai_response || 'Pending'}</ReactMarkdown>
              </MarkdownContent>

              {selectedQuery.clinician_response && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Clinician Response
                  </Typography>
                  <MarkdownContent>
                    <ReactMarkdown>{selectedQuery.clinician_response}</ReactMarkdown>
                  </MarkdownContent>
                </>
              )}

              <Box display="flex" gap={1} mt={2}>
                <Chip
                  label={selectedQuery.status}
                  color={getStatusColor(selectedQuery.status)}
                />
                <Chip
                  label={selectedQuery.urgency_level}
                  color={getUrgencyColor(selectedQuery.urgency_level)}
                />
                <Chip
                  label={selectedQuery.category}
                  variant="outlined"
                />
              </Box>

              <Box 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'warning.dark',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  DISCLAIMER: This response was generated by an AI system and has not been verified by a medical professional. 
                  Please wait for a clinician's review before making any medical decisions.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageContainer>
  );
};

export default PatientDashboard; 