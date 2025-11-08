import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  Tooltip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  AccessTime,
  Restaurant,
  CheckCircle,
  ArrowBack,
  Print,
  Share,
  FavoriteBorder,
  Favorite,
  Login,
  LocalFireDepartment,
  Egg,
  Grain,
  WaterDrop
} from '@mui/icons-material';
import { recipeAPI, isAPIConfigured } from '../../utils/api';
import authService from '../../services/authService';
import favoritesService from '../../services/favoritesService';
import customRecipeService from '../../services/customRecipeService';

const RecipeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [user, setUser] = useState(null);

  const isCustomRecipe = id.startsWith('custom-');

  useEffect(() => {
    loadRecipeDetails();
    checkUserAndFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkUserAndFavorite = async () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const favorited = await favoritesService.isFavorited(currentUser.id, id);
      setIsFavorited(!!favorited);
    }
  };

  const loadRecipeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // 自定义食谱：/recipe/custom-<id>
      if (isCustomRecipe) {
        const realId = id.replace('custom-', '');
        console.log('Loading custom recipe with id:', realId);

        const data = await customRecipeService.getRecipeById(realId);

        if (!data) {
          setError('Custom recipe not found');
          setRecipe(null);
        } else {
          setRecipe(data);
        }
      } else {
        // 普通 API 食谱
        if (isAPIConfigured()) {
          const data = await recipeAPI.getRecipeById(id);
          setRecipe(data);
        } else {
          setError('API key not configured. Please set Spoonacular API key.');
          setRecipe(null);
        }
      }
    } catch (err) {
      console.error('Error loading recipe details:', err);
      setError('Failed to load recipe details');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (!recipe) return;
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe link copied to clipboard!');
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await favoritesService.toggleFavorite(user.id, recipe);
      if (result.success) {
        setIsFavorited(!isFavorited);
        if (!isFavorited) {
          alert('Recipe added to favorites!');
        } else {
          alert('Recipe removed from favorites');
        }
      } else {
        alert(result.message || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Alert severity="error">Recipe not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/profile')}
          sx={{ mt: 2 }}
        >
          Back to Profile
        </Button>
      </Container>
    );
  }

  const getNutrientValue = (name) => {
    const nutrient = recipe.nutrition?.nutrients?.find(
      (n) => n.name.toLowerCase() === name.toLowerCase()
    );
    return nutrient ? `${Math.round(nutrient.amount)}${nutrient.unit}` : 'N/A';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Login Prompt Alert */}
      {showLoginPrompt && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          }
          onClose={() => setShowLoginPrompt(false)}
        >
          Login to save this recipe to your favorites and create meal plans!
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column - Image and Basic Info */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
              src={
                recipe.image ||
                'https://via.placeholder.com/556x370?text=No+Image'
              }
              alt={recipe.title}
            />
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Tooltip
                  title={
                    user
                      ? isFavorited
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                      : 'Login to save favorites'
                  }
                >
                  <IconButton
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                    sx={{ color: isFavorited ? 'error.main' : 'default' }}
                  >
                    {isFavorited ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
                <IconButton onClick={handlePrint}>
                  <Print />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* 自定义食谱可能没有 readyInMinutes，这里做保护 */}
                {(recipe.readyInMinutes || recipe.totalTime) && (
                  <Chip
                    icon={<AccessTime />}
                    label={
                      recipe.readyInMinutes
                        ? `${recipe.readyInMinutes} min`
                        : `${recipe.totalTime} min`
                    }
                    variant="outlined"
                  />
                )}
                {recipe.servings && (
                  <Chip
                    icon={<Restaurant />}
                    label={`${recipe.servings} servings`}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Paper>

          {/* Nutrition Summary Card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nutrition Facts (per serving)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalFireDepartment color="error" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Calories
                      </Typography>
                      <Typography variant="h6">
                        {getNutrientValue('Calories')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Egg color="warning" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Protein
                      </Typography>
                      <Typography variant="h6">
                        {getNutrientValue('Protein')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Grain color="primary" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Carbs
                      </Typography>
                      <Typography variant="h6">
                        {getNutrientValue('Carbohydrates')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WaterDrop color="info" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fat
                      </Typography>
                      <Typography variant="h6">
                        {getNutrientValue('Fat')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={7}>
          <Typography variant="h3" component="h1" gutterBottom>
            {recipe.title}
          </Typography>

          {recipe.summary && !isCustomRecipe && (
            <Typography
              variant="body1"
              paragraph
              dangerouslySetInnerHTML={{ __html: recipe.summary }}
              sx={{ mb: 3 }}
            />
          )}

          <Paper sx={{ mt: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Ingredients" />
              <Tab label="Instructions" />
              <Tab label="Nutrition Details" />
            </Tabs>

            {/* Ingredients Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Ingredients List
                </Typography>

                {recipe.extendedIngredients &&
                recipe.extendedIngredients.length > 0 ? (
                  <List>
                    {recipe.extendedIngredients.map((ingredient, index) => (
                      <ListItem
                        key={ingredient.id || index}
                        sx={{
                          py: 1.5,
                          borderBottom:
                            index < recipe.extendedIngredients.length - 1
                              ? '1px solid'
                              : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            ingredient.original ||
                            ingredient.originalString ||
                            ingredient
                          }
                          secondary={
                            ingredient.aisle
                              ? `Find in: ${ingredient.aisle}`
                              : null
                          }
                          primaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : recipe.ingredients && recipe.ingredients.length > 0 ? (
                  // 自定义食谱：简单字符串数组
                  <List>
                    {recipe.ingredients.map((ing, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          py: 1.5,
                          borderBottom:
                            index < recipe.ingredients.length - 1
                              ? '1px solid'
                              : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={ing}
                          primaryTypographyProps={{ variant: 'body1' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No ingredients information available for this recipe.
                  </Alert>
                )}
              </Box>
            )}

            {/* Instructions Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Cooking Instructions
                </Typography>
                {Array.isArray(recipe.instructions) &&
                recipe.instructions.length > 0 ? (
                  <Stepper orientation="vertical" activeStep={-1}>
                    {recipe.instructions.map((stepText, index) => (
                      <Step key={index} expanded>
                        <StepLabel>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Step {index + 1}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {stepText}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                ) : recipe.instructions ? (
                  <Box
                    sx={{
                      '& p': {
                        marginBottom: 2,
                        fontSize: '1rem',
                        lineHeight: 1.6
                      }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: recipe.instructions
                    }}
                  />
                ) : (
                  <Alert severity="info">
                    No instructions available for this recipe.
                  </Alert>
                )}
              </Box>
            )}

            {/* Nutrition Details Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Detailed Nutrition Information (per serving)
                </Typography>
                {recipe.nutrition?.nutrients &&
                recipe.nutrition.nutrients.length > 0 ? (
                  <Grid container spacing={2}>
                    {recipe.nutrition.nutrients.slice(0, 12).map((nutrient, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            height: '100%',
                            backgroundColor:
                              index < 4
                                ? 'rgba(46, 125, 50, 0.04)'
                                : 'background.paper',
                            border: index < 4 ? '2px solid' : '1px solid',
                            borderColor:
                              index < 4 ? 'primary.light' : 'divider'
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {nutrient.name}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {Math.round(nutrient.amount)}
                            {nutrient.unit}
                          </Typography>
                          {nutrient.percentOfDailyNeeds && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {Math.round(nutrient.percentOfDailyNeeds)}% Daily
                              Value
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No nutrition information available for this recipe.
                  </Alert>
                )}
              </Box>
            )}
          </Paper>

          {/* Call to Action */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Want to save this recipe?
            </Typography>
            <Typography variant="body2" paragraph>
              Create a free account to save your favorite recipes, create custom
              meal plans, and track your nutrition!
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Login />}
              onClick={() => navigate('/register')}
            >
              Sign Up Free
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecipeDetailsPage;
