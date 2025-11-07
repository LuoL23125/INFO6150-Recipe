import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Home, Login, PersonAdd } from '@mui/icons-material';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check current path to highlight active button
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Delicious Recipes
        </Typography>
        
        {/* Right side buttons */}
        <Button 
          color="inherit" 
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{ 
            mr: 1,
            backgroundColor: isActive('/') || isActive('/home') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          Home
        </Button>
        <Button 
          color="inherit" 
          startIcon={<Login />}
          onClick={() => navigate('/login')}
          sx={{ 
            mr: 1,
            backgroundColor: isActive('/login') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          Login
        </Button>
        <Button 
          color="inherit" 
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/register')}
          sx={{ 
            borderColor: 'white',
            backgroundColor: isActive('/register') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          Register
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;