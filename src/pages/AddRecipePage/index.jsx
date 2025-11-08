import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Close
} from '@mui/icons-material';
import authService from '../../services/authService';
import customRecipeService from '../../services/customRecipeService';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Form state
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

  // Check authentication
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  // Categories and difficulties
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
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese',
    'Thai', 'French', 'Greek', 'Spanish', 'American',
    'Mediterranean', 'Korean', 'Vietnamese', 'Other'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Handle number inputs
  const handleNumberChange = (name, value) => {
    const numValue = parseInt(value) || 0;
    setFormData({
      ...formData,
      [name]: numValue
    });

    // Update total time if prep or cook time changes
    if (name === 'prepTime' || name === 'cookTime') {
      const prep = name === 'prepTime' ? numValue : formData.prepTime;
      const cook = name === 'cookTime' ? numValue : formData.cookTime;
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
        totalTime: prep + cook
      }));
    }
  };

  // Handle ingredient changes
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // Handle instruction changes
  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] });
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: newInstructions });
  };

  // Handle tags
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Recipe title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    const validIngredients = formData.ingredients.filter(i => i.trim());
    if (validIngredients.length === 0) {
      errors.ingredients = 'At least one ingredient is required';
    }

    const validInstructions = formData.instructions.filter(i => i.trim());
    if (validInstructions.length === 0) {
      errors.instructions = 'At least one instruction step is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = authService.getCurrentUser();
      
      // Clean up empty ingredients and instructions
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(i => i.trim()),
        instructions: formData.instructions.filter(i => i.trim()),
        // If no image URL provided, use a placeholder
        image: formData.image || `https://via.placeholder.com/556x370?text=${encodeURIComponent(formData.title)}`
      };

      const result = await customRecipeService.createRecipe(user.id, cleanedData);

      if (result.success) {
        setSuccess('Recipe created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(result.message || 'Failed to create recipe');
      }
    } catch (err) {
      setError('An error occurred while creating the recipe');
      console.error('Create recipe error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stepper steps
  const steps = ['Basic Information', 'Ingredients', 'Instructions', 'Additional Details'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

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
          <Restaurant sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Add Your Recipe
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

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Basic Information */}
          <Step>
            <StepLabel>Basic Information</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
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
                    placeholder="e.g., Grandma's Chocolate Chip Cookies"
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
                    placeholder="Describe your recipe in a few sentences..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/recipe-image.jpg"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhotoCamera />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Provide a URL to an image of your dish (optional)"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Servings"
                    value={formData.servings}
                    onChange={(e) => handleNumberChange('servings', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Restaurant />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1, max: 50 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      label="Difficulty"
                    >
                      {difficulties.map(diff => (
                        <MenuItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Prep Time (min)"
                    value={formData.prepTime}
                    onChange={(e) => handleNumberChange('prepTime', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 1440 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cook Time (min)"
                    value={formData.cookTime}
                    onChange={(e) => handleNumberChange('cookTime', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 1440 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Time (min)"
                    value={formData.totalTime}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Ingredients */}
          <Step>
            <StepLabel>Ingredients</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                List all ingredients with quantities and measurements
              </Typography>
              
              {formErrors.ingredients && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.ingredients}
                </Alert>
              )}

              {formData.ingredients.map((ingredient, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label={`Ingredient ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="e.g., 2 cups all-purpose flour"
                  />
                  {formData.ingredients.length > 1 && (
                    <IconButton
                      onClick={() => removeIngredient(index)}
                      sx={{ ml: 1 }}
                      color="error"
                    >
                      <Remove />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button
                startIcon={<Add />}
                onClick={addIngredient}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Ingredient
              </Button>

              <Box sx={{ mt: 3 }}>
                <Button
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Instructions */}
          <Step>
            <StepLabel>Instructions</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Provide step-by-step instructions for preparing your recipe
              </Typography>

              {formErrors.instructions && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.instructions}
                </Alert>
              )}

              {formData.instructions.map((instruction, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        minWidth: 70,
                        mt: 1,
                        fontWeight: 'bold',
                        color: 'primary.main'
                      }}
                    >
                      Step {index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      placeholder="Describe this step in detail..."
                    />
                    {formData.instructions.length > 1 && (
                      <IconButton
                        onClick={() => removeInstruction(index)}
                        sx={{ ml: 1 }}
                        color="error"
                      >
                        <Remove />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}

              <Button
                startIcon={<Add />}
                onClick={addInstruction}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Step
              </Button>

              <Box sx={{ mt: 3 }}>
                <Button
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Additional Details */}
          <Step>
            <StepLabel>Additional Details</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Cuisine Type</InputLabel>
                    <Select
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleChange}
                      label="Cuisine Type"
                    >
                      <MenuItem value="">None</MenuItem>
                      {cuisines.map(cuisine => (
                        <MenuItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags (press Enter to add)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="e.g., gluten-free, vegetarian, quick"
                    />
                    <Button
                      onClick={handleAddTag}
                      sx={{ ml: 1 }}
                      variant="outlined"
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any tips, variations, or special notes about this recipe..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isPublic}
                        onChange={handleChange}
                        name="isPublic"
                        color="primary"
                      />
                    }
                    label="Make this recipe public (visible to other users)"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ mt: 1, mr: 1 }}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'Creating Recipe...' : 'Create Recipe'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profile')}
                  sx={{ mt: 1 }}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Container>
  );
};

export default AddRecipePage;