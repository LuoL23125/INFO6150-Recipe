import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search,
    FilterList,
    Clear,
    Info,
    Restaurant,
    ArrowBack,
    Add,
    Remove
} from '@mui/icons-material';
import authService from '../../services/authService';
import { recipeAPI } from '../../utils/api';
import RecipeCard from '../../components/RecipeCard';

const AdvancedSearchPage = () => {
    const navigate = useNavigate();

    // Check authentication
    const [user, setUser] = useState(null);

    // Search parameters
    const [searchParams, setSearchParams] = useState({
        query: '',
        diets: [],
        intolerances: [],
        includeIngredients: '',
        excludeIngredients: '',
        maxReadyTime: '',
        minCalories: '',
        maxCalories: '',
        number: 12
    });

    // Ingredients list management
    const [ingredientsList, setIngredientsList] = useState(['']);
    const [excludeIngredientsList, setExcludeIngredientsList] = useState(['']);

    // Search results and states
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Available options for filters
    const dietOptions = [
        'Gluten Free',
        'Ketogenic',
        'Vegetarian',
        'Lacto-Vegetarian',
        'Ovo-Vegetarian',
        'Vegan',
        'Pescetarian',
        'Paleo',
        'Primal',
        'Low FODMAP',
        'Whole30'
    ];

    const intoleranceOptions = [
        'Dairy',
        'Egg',
        'Gluten',
        'Grain',
        'Peanut',
        'Seafood',
        'Sesame',
        'Shellfish',
        'Soy',
        'Sulfite',
        'Tree Nut',
        'Wheat'
    ];

    useEffect(() => {
        // Check if user is logged in
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            // Redirect to login if not authenticated
            navigate('/login');
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    const handleParameterChange = (event) => {
        const { name, value } = event.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (event, field) => {
        const value =
            typeof event.target.value === 'string'
                ? event.target.value.split(',')
                : event.target.value;

        setSearchParams((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle ingredient list changes
    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredientsList];
        newIngredients[index] = value;
        setIngredientsList(newIngredients);
    };

    const addIngredient = () => {
        setIngredientsList([...ingredientsList, '']);
    };

    const removeIngredient = (index) => {
        if (ingredientsList.length > 1) {
            const newIngredients = ingredientsList.filter((_, i) => i !== index);
            setIngredientsList(newIngredients);
        }
    };

    // Handle exclude ingredients list
    const handleExcludeIngredientChange = (index, value) => {
        const newIngredients = [...excludeIngredientsList];
        newIngredients[index] = value;
        setExcludeIngredientsList(newIngredients);
    };

    const addExcludeIngredient = () => {
        setExcludeIngredientsList([...excludeIngredientsList, '']);
    };

    const removeExcludeIngredient = (index) => {
        if (excludeIngredientsList.length > 1) {
            const newIngredients = excludeIngredientsList.filter((_, i) => i !== index);
            setExcludeIngredientsList(newIngredients);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            // Build search parameters for API
            const params = {
                ...searchParams,
                includeIngredients: ingredientsList
                    .filter((i) => i.trim())
                    .join(','),
                excludeIngredients: excludeIngredientsList
                    .filter((i) => i.trim())
                    .join(','),
                diet: searchParams.diets.join(',').toLowerCase().replace(/\s+/g, ''),
                intolerances: searchParams.intolerances.join(',').toLowerCase()
            };

            // Clean up empty parameters
            Object.keys(params).forEach((key) => {
                if (!params[key] || params[key] === '') {
                    delete params[key];
                }
            });

            console.log('Advanced search params:', params);

            // Call the API with advanced parameters
            const results = await recipeAPI.advancedSearch(params);
            setSearchResults(results || []);

            if (!results || results.length === 0) {
                setError(
                    'No recipes found matching your criteria. Try adjusting your filters.'
                );
            }
        } catch (err) {
            console.error('Advanced search error:', err);
            setError('Failed to search recipes. Please try again.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = () => {
        setSearchParams({
            query: '',
            diets: [],
            intolerances: [],
            includeIngredients: '',
            excludeIngredients: '',
            maxReadyTime: '',
            minCalories: '',
            maxCalories: '',
            number: 12
        });
        setIngredientsList(['']);
        setExcludeIngredientsList(['']);
        setSearchResults([]);
        setHasSearched(false);
        setError('');
    };

    if (!user) {
        return (
            <Container sx={{ mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }


    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            {/* 顶部返回按钮 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    sx={{ mr: 1 }}
                >
                    Back to Home
                </Button>
            </Box>

            {/* 主体卡片 */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light' ? '#fafafa' : 'background.paper',
                }}
            >
                {/* 标题 + 说明 */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FilterList sx={{ mr: 1.5, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h5" component="h1">
                                Advanced Recipe Search
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Combine multiple filters to find recipes that match your preferences.
                            </Typography>
                        </Box>
                    </Box>

                    <Tooltip title="Advanced search allows you to find recipes that match specific dietary requirements, avoid certain ingredients, and meet nutritional criteria.">
                        <IconButton size="small">
                            <Info />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* 提示条 */}
                <Box
                    sx={{
                        mb: 3,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? 'rgba(25, 118, 210, 0.06)'
                                : 'rgba(144, 202, 249, 0.12)',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        Tip: You can leave the keyword empty and only use filters.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* 1. Basic Search */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        1. Basic Search
                    </Typography>
                    <TextField
                        fullWidth
                        label="Recipe Name or Keywords (Optional)"
                        name="query"
                        value={searchParams.query}
                        onChange={handleParameterChange}
                        placeholder="e.g., pasta, soup, chocolate cake"
                        helperText="Search for specific recipes or leave blank to only use filters"
                    />
                </Box>

                
{/* 2. Diet & Intolerances */}
<Box sx={{ mb: 4 }}> {/* 增加底部间距 */}
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}> {/* 使用更大的标题 */}
        2. Diet & Intolerances
    </Typography>

    <Grid container spacing={3}> {/* 增加网格间距 */}
        {/* Diets */}
        <Grid item xs={12} md={6}>
            <FormControl fullWidth> {/* 移除 size="small" */}
                <InputLabel id="diet-select-label" sx={{ fontSize: '1.1rem' }}> {/* 增大标签字体 */}
                    Diets (Select Multiple)
                </InputLabel>
                <Select
                    labelId="diet-select-label"
                    multiple
                    value={searchParams.diets}
                    onChange={(e) => handleMultiSelectChange(e, 'diets')}
                    input={<OutlinedInput label="Diets (Select Multiple)" />}
                    renderValue={(selected) => (
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1, // 增加芯片间距
                                maxHeight: 120, // 增加最大高度
                                overflowY: 'auto',
                                py: 0.5, // 添加内边距
                            }}
                        >
                            {selected.map((value) => (
                                <Chip 
                                    key={value} 
                                    label={value} 
                                    // 移除 size="small"，使用默认大小
                                    sx={{ 
                                        fontSize: '0.95rem', // 自定义字体大小
                                        height: 32 // 设置固定高度
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 400, // 增加菜单最大高度
                                width: 350, // 增加菜单宽度
                            },
                        },
                    }}
                    sx={{
                        minHeight: 56, // 设置最小高度
                        '& .MuiSelect-select': {
                            minHeight: 36, // 确保选择区域有足够高度
                            py: 1.5 // 增加垂直内边距
                        }
                    }}
                >
                    {dietOptions.map((diet) => (
                        <MenuItem key={diet} value={diet} sx={{ py: 1.2 }}> {/* 增加菜单项高度 */}
                            <Checkbox
                                checked={searchParams.diets.indexOf(diet) > -1}
                                sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }} // 增大复选框
                            />
                            <ListItemText 
                                primary={diet} 
                                primaryTypographyProps={{ 
                                    fontSize: '1rem' // 增大文字
                                }}
                            />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>

        {/* Intolerances */}
        <Grid item xs={12} md={6}>
            <FormControl fullWidth> {/* 移除 size="small" */}
                <InputLabel id="intolerance-select-label" sx={{ fontSize: '1.1rem' }}>
                    Intolerances (Select Multiple)
                </InputLabel>
                <Select
                    labelId="intolerance-select-label"
                    multiple
                    value={searchParams.intolerances}
                    onChange={(e) => handleMultiSelectChange(e, 'intolerances')}
                    input={<OutlinedInput label="Intolerances (Select Multiple)" />}
                    renderValue={(selected) => (
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                maxHeight: 120,
                                overflowY: 'auto',
                                py: 0.5,
                            }}
                        >
                            {selected.map((value) => (
                                <Chip
                                    key={value}
                                    label={value}
                                    color="warning"
                                    variant="outlined"
                                    sx={{ 
                                        fontSize: '0.95rem',
                                        height: 32,
                                        borderWidth: 1.5 // 加粗边框使其更明显
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                maxHeight: 400,
                                width: 350,
                            },
                        },
                    }}
                    sx={{
                        minHeight: 56,
                        '& .MuiSelect-select': {
                            minHeight: 36,
                            py: 1.5
                        }
                    }}
                >
                    {intoleranceOptions.map((intolerance) => (
                        <MenuItem key={intolerance} value={intolerance} sx={{ py: 1.2 }}>
                            <Checkbox
                                checked={searchParams.intolerances.indexOf(intolerance) > -1}
                                sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                            />
                            <ListItemText 
                                primary={intolerance}
                                primaryTypographyProps={{ 
                                    fontSize: '1rem'
                                }}
                            />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
    </Grid>
</Box>

                {/* 3. Ingredients */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        3. Ingredients
                    </Typography>
                    <Grid container spacing={2}>
                        {/* Must Include */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 2, height: '100%' }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    Must Include:
                                </Typography>
                                {ingredientsList.map((ingredient, index) => (
                                    <Box
                                        key={index}
                                        sx={{ display: 'flex', gap: 1, mb: 1 }}
                                    >
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={ingredient}
                                            onChange={(e) =>
                                                handleIngredientChange(index, e.target.value)
                                            }
                                            placeholder="e.g., chicken, tomatoes"
                                        />
                                        {ingredientsList.length > 1 && (
                                            <IconButton
                                                onClick={() => removeIngredient(index)}
                                                size="small"
                                            >
                                                <Remove fontSize="small" />
                                            </IconButton>
                                        )}
                                        {index === ingredientsList.length - 1 && (
                                            <IconButton
                                                onClick={addIngredient}
                                                size="small"
                                                color="primary"
                                            >
                                                <Add fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>

                        {/* Must NOT Include */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 2, height: '100%' }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    Must NOT Include:
                                </Typography>
                                {excludeIngredientsList.map((ingredient, index) => (
                                    <Box
                                        key={index}
                                        sx={{ display: 'flex', gap: 1, mb: 1 }}
                                    >
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={ingredient}
                                            onChange={(e) =>
                                                handleExcludeIngredientChange(index, e.target.value)
                                            }
                                            placeholder="e.g., nuts, shellfish"
                                        />
                                        {excludeIngredientsList.length > 1 && (
                                            <IconButton
                                                onClick={() => removeExcludeIngredient(index)}
                                                size="small"
                                            >
                                                <Remove fontSize="small" />
                                            </IconButton>
                                        )}
                                        {index === excludeIngredientsList.length - 1 && (
                                            <IconButton
                                                onClick={addExcludeIngredient}
                                                size="small"
                                                color="primary"
                                            >
                                                <Add fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* 4. Time & Calories */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                        4. Time & Calories
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Max Ready Time (minutes)"
                                name="maxReadyTime"
                                value={searchParams.maxReadyTime}
                                onChange={handleParameterChange}
                                InputProps={{ inputProps: { min: 0, max: 300 } }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Min Calories"
                                name="minCalories"
                                value={searchParams.minCalories}
                                onChange={handleParameterChange}
                                InputProps={{ inputProps: { min: 0 } }}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Max Calories"
                                name="maxCalories"
                                value={searchParams.maxCalories}
                                onChange={handleParameterChange}
                                InputProps={{ inputProps: { min: 0 } }}
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* 按钮区 */}
                <Divider sx={{ my: 3 }} />
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap',
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={handleClearAll}
                        disabled={loading}
                    >
                        Clear All
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Search />}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search Recipes'}
                    </Button>
                </Box>
            </Paper>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error Message */}
            {error && !loading && (
                <Alert severity="warning" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Search Results */}
            {!loading && hasSearched && searchResults.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Found {searchResults.length} Recipes
                    </Typography>
                    <Grid container spacing={3}>
                        {searchResults.map((recipe) => (
                            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                                <RecipeCard recipe={recipe} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* No Results */}
            {!loading && hasSearched && searchResults.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Restaurant sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No recipes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or search with different ingredients
                    </Typography>
                </Paper>
            )}
        </Container>
    );


};

export default AdvancedSearchPage;
