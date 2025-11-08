import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  Button,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { PersonAdd, Login } from '@mui/icons-material';
import SearchBar from '../../components/SearchBar';
import RecipeCard from '../../components/RecipeCard';
import { recipeAPI, isAPIConfigured } from '../../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [recipeOfTheDay, setRecipeOfTheDay] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(true);

  // Load Recipe of the Day
  useEffect(() => {
    loadRecipeOfTheDay();
  }, []);

  const loadRecipeOfTheDay = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAPIConfigured()) {
        const recipe = await recipeAPI.getRandomRecipe();
        setRecipeOfTheDay(recipe);
      } else {
        // Use mock data if API is not configured
        setRecipeOfTheDay(mockData.randomRecipe);
        setError('Using demo data. Configure your Spoonacular API key in utils/api.js for real recipes.');
      }
    } catch (err) {
      setError('Failed to load Recipe of the Day');
      setRecipeOfTheDay(mockData.randomRecipe);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setSearchQuery(query);
    setLoading(true);
    setError(null);
    
    try {
      if (isAPIConfigured()) {
        const results = await recipeAPI.searchRecipes(query);
        setSearchResults(results);
      } else {
        // Use mock data if API is not configured
        setSearchResults(mockData.searchResults);
        setError('Using demo data. Configure your Spoonacular API key for real search results.');
      }
    } catch (err) {
      setError('Failed to search recipes');
      setSearchResults(mockData.searchResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Delicious Recipes
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Discover amazing recipes from around the world
        </Typography>
      </Box>

      {/* Registration Prompt */}
      {showRegistrationPrompt && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: 'linear-gradient(45deg, #2e7d32 30%, #66bb6a 90%)',
            color: 'white',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                🎉 Join Our Community!
              </Typography>
              <Typography variant="body2">
                Create a free account to save your favorite recipes, create meal plans, and more!
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: 'white', 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'grey.100' }
                }}
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </Button>
              <Button
                variant="outlined"
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  }
                }}
                startIcon={<Login />}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </Box>
          </Box>
          <Button
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              color: 'white',
              minWidth: 'auto'
            }}
            onClick={() => setShowRegistrationPrompt(false)}
          >
            ✕
          </Button>
        </Paper>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <SearchBar onSearch={handleSearch} />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Search Results */}
      {searchQuery && searchResults.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            Search Results for "{searchQuery}"
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((recipe) => (
              <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {searchQuery && searchResults.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 4 }}>
          No recipes found for "{searchQuery}". Try a different search term.
        </Alert>
      )}

      {searchQuery && <Divider sx={{ my: 4 }} />}

      {/* Recipe of the Day */}
      {!loading && recipeOfTheDay && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            {searchQuery ? 'Or Try Our Recipe of the Day' : 'Recipe of the Day'}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
              <RecipeCard recipe={recipeOfTheDay} featured={true} />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Popular Categories */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Popular Searches
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['Pasta', 'Chicken', 'Salad', 'Soup', 'Dessert', 'Vegetarian', 'Quick', 'Healthy'].map((term) => (
            <Button
              key={term}
              variant="outlined"
              onClick={() => handleSearch(term)}
              sx={{ textTransform: 'none' }}
            >
              {term}
            </Button>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;