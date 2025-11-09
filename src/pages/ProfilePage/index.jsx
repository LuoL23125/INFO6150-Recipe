import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Delete,
  Favorite,
  Restaurant,
  AccessTime,
  CalendarMonth,
  Person,
  Email,
  DateRange,
  FavoriteBorder,
  Visibility,
  Add
} from '@mui/icons-material';
import authService from '../../services/authService';
import customRecipeService from '../../services/customRecipeService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    // Check if we should show a specific tab
    if (location.state?.showTab === 'favorites') {
      setTabValue(1); // Favorites is now at index 1
    }
    loadUserData();
  }, [location.state]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setUser(currentUser);
      setEditedUser({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
      });

      const userId = currentUser.id;
      console.log('Using userId for queries:', userId, 'Type:', typeof userId);

      // Load user's custom recipes
      await loadCustomRecipes(userId);
      // Load user's favorites
      await loadFavorites(userId);
      // Load user's meal plans
      await loadMealPlans(userId);

    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/favorites?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const loadMealPlans = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/mealPlans?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMealPlans(data);
      }
    } catch (err) {
      console.error('Error loading meal plans:', err);
    }
  };

  const loadCustomRecipes = async (userId) => {
    try {
      console.log('Loading custom recipes for userId:', userId, 'Type:', typeof userId);
      
      const recipes = await customRecipeService.getUserRecipes(userId);
      console.log('Custom recipes loaded:', recipes);
      setCustomRecipes(recipes);
    } catch (err) {
      console.error('Error loading custom recipes:', err);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      const result = await authService.updateProfile(user.id, editedUser);
      if (result.success) {
        setUser(result.user);
        setSuccessMessage('Profile updated successfully!');
        setEditMode(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const response = await fetch(`http://localhost:3001/favorites/${favoriteId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== favoriteId));
        setSuccessMessage('Recipe removed from favorites');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to remove favorite');
    }
  };

  const removeMealPlan = async (planId) => {
    try {
      const response = await fetch(`http://localhost:3001/mealPlans/${planId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMealPlans(mealPlans.filter(p => p.id !== planId));
        setSuccessMessage('Meal plan deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete meal plan');
    }
  };

  const removeCustomRecipe = async (recipeId) => {
    try {
      const result = await customRecipeService.deleteRecipe(recipeId, user.id);
      
      if (result.success) {
        setCustomRecipes(customRecipes.filter(r => r.id !== recipeId));
        setSuccessMessage('Custom recipe deleted');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete custom recipe');
    }
  };

  const handleDeleteClick = (type, item) => {
    setItemToDelete({ type, item });
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      switch (itemToDelete.type) {
        case 'favorite':
          removeFavorite(itemToDelete.item.id);
          break;
        case 'mealPlan':
          removeMealPlan(itemToDelete.item.id);
          break;
        case 'customRecipe':
          removeCustomRecipe(itemToDelete.item.id);
          break;
      }
    }
    setDeleteDialog(false);
    setItemToDelete(null);
  };

  const getUserInitials = () => {
    if (!user) return '';
    const first = user.firstName?.[0] || user.name?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Please login to view your profile</Alert>
        <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {getUserInitials()}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={7}>
            {editMode ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={editedUser.firstName}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={editedUser.lastName}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                  type="email"
                />
              </Box>
            ) : (
              <>
                <Typography variant="h4" gutterBottom>
                  {user.name || `${user.firstName} ${user.lastName}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<Email />}
                    label={user.email}
                    variant="outlined"
                  />
                  <Chip
                    icon={<DateRange />}
                    label={`Member since ${new Date(user.createdAt).toLocaleDateString()}`}
                    variant="outlined"
                  />
                  <Chip
                    icon={<Person />}
                    label={user.isAdmin ? 'Admin' : 'Member'}
                    color={user.isAdmin ? 'secondary' : 'default'}
                  />
                </Box>
              </>
            )}
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {editMode ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    size="small"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleEditToggle}
                    size="small"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditToggle}
                  size="small"
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Statistics */}
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={4}>
              <Typography variant="h5" color="primary">
                {customRecipes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                My Recipes
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h5" color="primary">
                {favorites.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Favorites
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h5" color="primary">
                {mealPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Meal Plans
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Content Tabs - 调整顺序：My Recipes 优先 */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`My Recipes (${customRecipes.length})`} icon={<Restaurant />} />
          <Tab label={`Favorites (${favorites.length})`} icon={<Favorite />} />
          <Tab label={`Meal Plans (${mealPlans.length})`} icon={<CalendarMonth />} />
        </Tabs>

        <Box sx={{ p: 3, minHeight: 400 }}>
          {/* My Recipes Tab - 现在是第一个 (tabValue === 0) */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Add Recipe Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/add-recipe')}
                  >
                    Add New Recipe
                  </Button>
                </Box>
              </Grid>
              
              {customRecipes.length > 0 ? (
                customRecipes.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={recipe.image || 'https://via.placeholder.com/300x200?text=My+Recipe'}
                        alt={recipe.title}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {recipe.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {recipe.description || 'No description'}
                        </Typography>
                        {recipe.tags && recipe.tags.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {recipe.tags.slice(0, 3).map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          {recipe.prepTime && (
                            <Chip
                              icon={<AccessTime />}
                              label={`${recipe.prepTime} min prep`}
                              size="small"
                            />
                          )}
                          {recipe.difficulty && (
                            <Chip
                              label={recipe.difficulty}
                              size="small"
                              color={
                                recipe.difficulty === 'easy' ? 'success' :
                                recipe.difficulty === 'hard' ? 'error' : 'warning'
                              }
                            />
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/recipe/custom-${recipe.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick('customRecipe', recipe)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Restaurant sx={{ fontSize: 60, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No custom recipes yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Share your own recipes with the community!
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 3 }}
                      onClick={() => navigate('/add-recipe')}
                      startIcon={<Add />}
                    >
                      Add Your First Recipe
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Favorites Tab - 现在是第二个 (tabValue === 1) */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              {favorites.length > 0 ? (
                favorites.map((favorite) => (
                  <Grid item xs={12} sm={6} md={4} key={favorite.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={favorite.image || 'https://via.placeholder.com/300x200'}
                        alt={favorite.title}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {favorite.title}
                        </Typography>
                        {favorite.readyInMinutes && (
                          <Chip
                            icon={<AccessTime />}
                            label={`${favorite.readyInMinutes} min`}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {favorite.servings && (
                          <Chip
                            icon={<Restaurant />}
                            label={`${favorite.servings} servings`}
                            size="small"
                          />
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/recipe/${favorite.recipeId}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick('favorite', favorite)}
                        >
                          Remove
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <FavoriteBorder sx={{ fontSize: 60, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                      No favorites yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start exploring recipes and save your favorites!
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 3 }}
                      onClick={() => navigate('/')}
                    >
                      Explore Recipes
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Meal Plans Tab - 现在是第三个 (tabValue === 2) */}
          {tabValue === 2 && (
            <Box>
              {mealPlans.length > 0 ? (
                <List>
                  {mealPlans.map((plan, index) => (
                    <React.Fragment key={plan.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <CalendarMonth />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={plan.name}
                          secondary={`Week of ${plan.week} • ${Object.keys(plan.planData || {}).length} days planned`}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => console.log('View meal plan:', plan.id)}
                          >
                            View
                          </Button>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDeleteClick('mealPlan', plan)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < mealPlans.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CalendarMonth sx={{ fontSize: 60, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    No meal plans yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first meal plan to get organized!
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() => console.log('Create meal plan')}
                  >
                    Create Meal Plan
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this{' '}
            {itemToDelete?.type === 'favorite' && 'favorite recipe'}
            {itemToDelete?.type === 'mealPlan' && 'meal plan'}
            {itemToDelete?.type === 'customRecipe' && 'custom recipe'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;