import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Home, 
  Login, 
  PersonAdd, 
  AccountCircle,
  Logout,
  Favorite,
  Dashboard
} from '@mui/icons-material';
import authService from '../../services/authService';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [location]); // Re-check on route change

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    handleMenuClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleFavorites = () => {
    handleMenuClose();
    navigate('/favorites');
  };

  const handleDashboard = () => {
    handleMenuClose();
    navigate('/dashboard');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    const first = user.firstName?.[0] || user.name?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
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
        
        {/* Navigation Buttons */}
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

        {/* User Authentication Section */}
        {user ? (
          // Logged in user menu
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user.firstName || user.name}!
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="large"
              sx={{ 
                ml: 1,
                backgroundColor: anchorEl ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
              color="inherit"
            >
              {getUserInitials() ? (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {getUserInitials()}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleDashboard}>
                <Dashboard sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleFavorites}>
                <Favorite sx={{ mr: 1 }} />
                My Favorites
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          // Guest buttons
          <>
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
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;