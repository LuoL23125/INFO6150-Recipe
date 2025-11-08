import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  Restaurant,
  FavoriteBorder,
  Favorite,
  Share,
  Visibility
} from '@mui/icons-material';
import authService from '../../services/authService';
import favoritesService from '../../services/favoritesService';

const RecipeCard = ({ recipe, featured = false }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserAndFavorite();
  }, [recipe.id]);

  const checkUserAndFavorite = async () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser && recipe.id) {
      // Check if recipe is favorited
      const favorited = await favoritesService.isFavorited(currentUser.id, recipe.id);
      setIsFavorited(!!favorited);
    }
  };

  const handleViewRecipe = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleShare = () => {
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: `${window.location.origin}/recipe/${recipe.id}`
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/recipe/${recipe.id}`);
      alert('Recipe link copied to clipboard!');
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await favoritesService.toggleFavorite(user.id, recipe);
      if (result.success) {
        setIsFavorited(!isFavorited);
        // Optional: Show a snackbar or toast notification
        console.log(result.message);
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        ...(featured && {
          boxShadow: 4,
          border: '2px solid',
          borderColor: 'primary.main'
        })
      }}
    >
      {featured && (
        <Chip
          label="Recipe of the Day"
          color="primary"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1
          }}
        />
      )}
      
      <CardMedia
        component="img"
        height={featured ? "300" : "200"}
        image={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={recipe.title}
        sx={{ cursor: 'pointer' }}
        onClick={handleViewRecipe}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          gutterBottom 
          variant={featured ? "h4" : "h6"} 
          component="h2"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' }
          }}
          onClick={handleViewRecipe}
        >
          {recipe.title}
        </Typography>
        
        {recipe.summary && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: featured ? 3 : 2,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
            dangerouslySetInnerHTML={{ 
              __html: recipe.summary 
            }}
          />
        )}
        
        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
          {recipe.readyInMinutes && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {recipe.readyInMinutes} min
              </Typography>
            </Box>
          )}
          
          {recipe.servings && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Restaurant fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {recipe.servings} servings
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          startIcon={<Visibility />}
          onClick={handleViewRecipe}
        >
          View Recipe
        </Button>
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title={
            user 
              ? (isFavorited ? "Remove from favorites" : "Add to favorites")
              : "Login to save favorites"
          }>
            <IconButton 
              size="small" 
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              sx={{ 
                color: isFavorited ? 'error.main' : 'default',
                '&:hover': {
                  color: isFavorited ? 'error.dark' : 'error.light'
                }
              }}
            >
              {favoriteLoading ? (
                <CircularProgress size={20} />
              ) : (
                isFavorited ? <Favorite /> : <FavoriteBorder />
              )}
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={handleShare}>
            <Share />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default RecipeCard;