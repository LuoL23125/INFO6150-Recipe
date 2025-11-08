import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Link,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import authService from '../../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showDemo, setShowDemo] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const result = await authService.login(formData.email, formData.password);
      
      if (result.success) {
        // Redirect to home or previous page
        navigate('/');
      } else {
        setApiError(result.message || 'Invalid email or password');
      }
    } catch (error) {
      setApiError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'demo123'
    });
    setShowDemo(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <LoginIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            Sign In
          </Typography>

          {/* Error Message */}
          {apiError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {apiError}
            </Alert>
          )}

          {/* Demo Account Info */}
          {showDemo && (
            <>
              <Alert 
                severity="info" 
                sx={{ width: '100%', mb: 2 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={handleDemoLogin}
                  >
                    Fill Demo
                  </Button>
                }
              >
                <Typography variant="caption">
                  <strong>Demo Account:</strong><br />
                  Email: demo@example.com<br />
                  Password: demo123
                </Typography>
              </Alert>
              <Divider sx={{ width: '100%', mb: 2 }} />
            </>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isLoading}
            />
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
            />
            
            <Link 
              component="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                console.log('Forgot password clicked');
              }}
              sx={{ 
                color: '#2e7d32',
                alignSelf: 'flex-end',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
              disabled={isLoading}
            >
              Forgot password?
            </Link>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 1,
                py: 1.5,
                backgroundColor: '#2e7d32',
                '&:hover': { backgroundColor: '#1b5e20' }
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                  Signing In...
                </>
              ) : (
                'SIGN IN'
              )}
            </Button>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center"
              sx={{ mt: 1 }}
            >
              Don't have an account?{' '}
              <Link 
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
                sx={{ color: '#2e7d32', fontWeight: 500 }}
                disabled={isLoading}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;