import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Remove,
  Save,
  Cancel,
  Restaurant,
  AccessTime,
  ArrowBack,
  PhotoCamera,
  Edit as EditIcon
} from '@mui/icons-material';
import authService from '../../services/authService';
import customRecipeService from '../../services/customRecipeService';

const EditRecipePage = () => {
  const { id } = useParams(); // 这里的 id 是纯数字字符串，如 "1762609773179"
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    totalTime: 45,
    difficulty: 'medium',
    cuisine: '',
    category: 'main',
    ingredients: [''],
    instructions: [''],
    tags: [],
    isPublic: false,
    notes: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'main', label: 'Main Course' },
    { value: 'side', label: 'Side Dish' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'snack', label: 'Snack' },
    { value: 'beverage', label: 'Beverage' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const cuisines = [
    'Italian',
    'Chinese',
    'Mexican',
    'Indian',
    'Japanese',
    'Thai',
    'French',
    'Greek',
    'Spanish',
    'American',
    'Mediterranean',
    'Korean',
    'Vietnamese',
    'Other'
  ];

  useEffect(() => {
    loadRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRecipe = async () => {
    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const recipe = await customRecipeService.getRecipeById(id);

      if (!recipe) {
        setError('Recipe not found');
        setTimeout(() => navigate('/profile'), 2000);
        return;
      }

      // 这里用字符串比较，避免 "1" !== 1
      if (String(recipe.userId) !== String(user.id)) {
        setError('You are not authorized to edit this recipe');
        setTimeout(() => navigate('/profile'), 2000);
        return;
      }

      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        image: recipe.image || '',
        servings: recipe.servings || 4,
        prepTime: recipe.prepTime || 15,
        cookTime: recipe.cookTime || 30,
        totalTime: recipe.totalTime || recipe.prepTime + recipe.cookTime || 45,
        difficulty: recipe.difficulty || 'medium',
        cuisine: recipe.cuisine || '',
        category: recipe.category || 'main',
        ingredients: recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [''],
        instructions: recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions : [''],
        tags: recipe.tags || [],
        isPublic: !!recipe.isPublic,
        notes: recipe.notes || ''
      });
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleNumberChange = (name, value) => {
    const numValue = parseInt(value, 10) || 0;
    setFormData((prev) => {
      const updated = { ...prev, [name]: numValue };
      if (name === 'prepTime' || name === 'cookTime') {
        const prep = name === 'prepTime' ? numValue : prev.prepTime;
        const cook = name === 'cookTime' ? numValue : prev.cookTime;
        updated.totalTime = prep + cook;
      }
      return updated;
    });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, instructions: newInstructions }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Recipe title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    const validIngredients = formData.ingredients.filter((i) => i.trim());
    if (validIngredients.length === 0) {
      errors.ingredients = 'At least one ingredient is required';
    }

    const validInstructions = formData.instructions.filter((i) => i.trim());
    if (validInstructions.length === 0) {
      errors.instructions = 'At least one instruction step is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setError('Please login first');
        return;
      }

      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter((i) => i.trim()),
        instructions: formData.instructions.filter((i) => i.trim()),
        image:
          formData.image ||
          'https://via.placeholder.com/600x400?text=Custom+Recipe'
      };

      const result = await customRecipeService.updateRecipe(
        id,
        user.id,
        cleanedData
      );

      if (result.success) {
        setSuccess('Recipe updated successfully! Redirecting.');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(result.message || 'Failed to update recipe');
      }
    } catch (err) {
      setError('An error occurred while updating the recipe');
      console.error('Update recipe error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/profile')}
        sx={{ mb: 2 }}
      >
        Back to Profile
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          <EditIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Edit Recipe
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Recipe Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!formErrors.title}
              helperText={formErrors.title}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!formErrors.description}
              helperText={formErrors.description}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PhotoCamera />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Servings"
              type="number"
              value={formData.servings}
              onChange={(e) => handleNumberChange('servings', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Restaurant />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Time & Difficulty */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Time & Difficulty
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Prep Time (min)"
              type="number"
              value={formData.prepTime}
              onChange={(e) => handleNumberChange('prepTime', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTime />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Cook Time (min)"
              type="number"
              value={formData.cookTime}
              onChange={(e) => handleNumberChange('cookTime', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTime />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Total Time (min)"
              type="number"
              value={formData.totalTime}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTime />
                  </InputAdornment>
                ),
                readOnly: true
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                name="difficulty"
                value={formData.difficulty}
                label="Difficulty"
                onChange={handleChange}
              >
                {difficulties.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Cuisine & Public */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Cuisine</InputLabel>
              <Select
                name="cuisine"
                value={formData.cuisine}
                label="Cuisine"
                onChange={handleChange}
              >
                {cuisines.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPublic}
                  onChange={handleChange}
                  name="isPublic"
                />
              }
              label="Make this recipe public"
            />
          </Grid>

          {/* Ingredients */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Ingredients
            </Typography>
            {formErrors.ingredients && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {formErrors.ingredients}
              </Alert>
            )}
          </Grid>

          <Grid item xs={12}>
            {formData.ingredients.map((ingredient, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 1,
                  alignItems: 'center'
                }}
              >
                <TextField
                  fullWidth
                  label={`Ingredient ${index + 1}`}
                  value={ingredient}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
                  }
                />
                <IconButton
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length === 1}
                >
                  <Remove />
                </IconButton>
                {index === formData.ingredients.length - 1 && (
                  <IconButton onClick={addIngredient}>
                    <Add />
                  </IconButton>
                )}
              </Box>
            ))}
          </Grid>

          {/* Instructions */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Instructions
            </Typography>
            {formErrors.instructions && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {formErrors.instructions}
              </Alert>
            )}
          </Grid>

          <Grid item xs={12}>
            {formData.instructions.map((instruction, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 1,
                  alignItems: 'flex-start'
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={`Step ${index + 1}`}
                  value={instruction}
                  onChange={(e) =>
                    handleInstructionChange(index, e.target.value)
                  }
                />
                <IconButton
                  onClick={() => removeInstruction(index)}
                  disabled={formData.instructions.length === 1}
                >
                  <Remove />
                </IconButton>
                {index === formData.instructions.length - 1 && (
                  <IconButton onClick={addInstruction}>
                    <Add />
                  </IconButton>
                )}
              </Box>
            ))}
          </Grid>

          {/* Tags & Notes */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Tags & Notes
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
              />
              <Button variant="outlined" onClick={handleAddTag}>
                Add Tag
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Personal Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate('/profile')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EditRecipePage;
