import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  styled,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  MedicalServices as MedicalServicesIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  LogoutRounded as LogoutIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api, QueryResponse, Query } from '../services/api';

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

const MarkdownContainer = styled(Box)(({ theme }) => ({
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    color: theme.palette.primary.main,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  '& h1': {
    fontSize: '1.8rem',
  },
  '& h2': {
    fontSize: '1.5rem',
  },
  '& h3': {
    fontSize: '1.3rem',
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
    marginBottom: theme.spacing(1),
  },
  '& strong': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '& em': {
    fontStyle: 'italic',
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    marginRight: 0,
    marginBottom: theme.spacing(2),
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  '& code': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(0.5),
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(2),
    borderRadius: '4px',
    overflowX: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  '& hr': {
    border: 'none',
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: theme.spacing(2, 0),
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const StyledAnalyticsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  height: '100%',
}));

// Add these color constants
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
];

interface Analytics {
  total_queries: number;
  pending_review: number;
  average_response_time: number;
  category_stats: Record<string, number>;
}

const ClinicianDashboard = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const navigate = useNavigate();

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await api.get<QueryResponse>(`api/queries?page=${page}&per_page=5`);
      setQueries(response.queries);
      setTotalPages(response.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queries');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get<Analytics>('api/queries/analytics');
      setAnalytics(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page]);

  const handleQueryClick = (query: Query) => {
    setSelectedQuery(query);
    setReviewText('');
  };

  const handleReviewSubmit = async () => {
    if (!selectedQuery || !reviewText.trim()) return;

    try {
      await api.post(`api/queries/${selectedQuery.id}/review`, {
        response: reviewText,
      });

      setSelectedQuery(null);
      fetchQueries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  // Transform analytics data for charts
  const prepareChartData = (analytics: Analytics | null) => {
    if (!analytics) return [];
    return Object.entries(analytics.category_stats).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  };

  // Format time for display
  const formatResponseTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <PageContainer>
      <StyledPaper>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MedicalServicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 600 }}>
              Clinician Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Analytics">
              <IconButton 
                onClick={() => {
                  setShowAnalytics(true);
                  fetchAnalytics();
                }}
                sx={{ color: 'white' }}
              >
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchQueries} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : queries.length > 0 ? (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mb={2}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Pending Reviews
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
                            color="primary"
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
                          {query.is_anonymous && (
                            <Chip
                              label="Anonymous"
                              size="small"
                              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                            />
                          )}
                        </Box>
                      }
                    />
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
              No Pending Reviews
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
              All queries have been reviewed
            </Typography>
          </Box>
        )}
      </StyledPaper>

      {/* Query Review Dialog */}
      <Dialog 
        open={!!selectedQuery} 
        onClose={() => setSelectedQuery(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
          }
        }}
      >
        {selectedQuery && (
          <>
            <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              Review Query
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', mt: 2 }}>
                Patient Question:
              </Typography>
              <Typography paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {selectedQuery.question}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ color: 'white', mt: 3 }}>
                AI Response:
              </Typography>
              <Paper 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                }}
              >
                <MarkdownContainer>
                  <ReactMarkdown>
                    {selectedQuery.ai_response}
                  </ReactMarkdown>
                </MarkdownContainer>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Your Review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: 'primary.main',
                    },
                  },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
              <Button 
                onClick={() => setSelectedQuery(null)}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    color: 'white',
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReviewSubmit}
                variant="contained"
                disabled={!reviewText.trim()}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                }}
              >
                Submit Review
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            color: 'white',
            minHeight: '600px',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '1.5rem',
        }}>
          Analytics Dashboard
        </DialogTitle>
        <DialogContent>
          {analytics ? (
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                {/* Response Time Card */}
                <Grid item xs={12}>
                  <StyledAnalyticsPaper>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Average Response Time
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'primary.main', mb: 2 }}>
                      {formatResponseTime(analytics.average_response_time)}
                    </Typography>
                  </StyledAnalyticsPaper>
                </Grid>

                {/* Pie Chart */}
                <Grid item xs={12} md={6}>
                  <StyledAnalyticsPaper>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Query Distribution by Category
                    </Typography>
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(analytics)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareChartData(analytics).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number, name: string) => [`${value} queries`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </StyledAnalyticsPaper>
                </Grid>

                {/* Bar Chart */}
                <Grid item xs={12} md={6}>
                  <StyledAnalyticsPaper>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Query Volume by Category
                    </Typography>
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={prepareChartData(analytics)}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                            labelStyle={{ color: 'white' }}
                          />
                          <Bar dataKey="value" fill="#8884d8">
                            {prepareChartData(analytics).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </StyledAnalyticsPaper>
                </Grid>

                {/* Detailed Stats */}
                <Grid item xs={12}>
                  <StyledAnalyticsPaper>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Detailed Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(analytics.category_stats).map(([category, count], index) => (
                        <Grid item xs={12} sm={6} md={4} key={category}>
                          <Box 
                            p={2} 
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                              {category}
                            </Typography>
                            <Typography variant="h4" sx={{ color: COLORS[index % COLORS.length] }}>
                              {count}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              queries
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </StyledAnalyticsPaper>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
          <Button 
            onClick={() => setShowAnalytics(false)}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ClinicianDashboard; 