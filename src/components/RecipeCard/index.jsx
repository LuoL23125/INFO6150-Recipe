import React from 'react';
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
  Tooltip
} from '@mui/material';
import {
  AccessTime,
  Restaurant,
  FavoriteBorder,
  Share,
  Visibility
} from '@mui/icons-material';

const RecipeCard = ({ recipe, featured = false }) => {
  const navigate = useNavigate();

  const handleViewRecipe = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleShare = () => {
    // Simple share functionality
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe link copied to clipboard!');
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
          <Tooltip title="Login to save favorites">
            <IconButton size="small" disabled>
              <FavoriteBorder />
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