import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Person, Favorite, CalendarMonth, Restaurant } from '@mui/icons-material';

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Links
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<Person />}
            onClick={() => navigate('/profile')}
          >
            My Profile
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Favorite />}
            onClick={() => navigate('/profile')}
          >
            My Favorites
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CalendarMonth />}
            onClick={() => navigate('/profile')}
          >
            Meal Plans
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Restaurant />}
            onClick={() => navigate('/profile')}
          >
            My Recipes
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          All your recipe management features are available in your profile page.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DashboardPage;