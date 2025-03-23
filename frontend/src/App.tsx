import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import ClinicianDashboard from './pages/ClinicianDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/clinician/dashboard" element={<ClinicianDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Add more routes here as we create them */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
