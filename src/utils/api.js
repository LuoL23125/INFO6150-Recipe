// Enhanced API Service with JSON Server caching
// This service tries Spoonacular API first, falls back to JSON Server cache

const API_KEY = 'a7585a8f408c45b8b7f6627145388a33';
const SPOONACULAR_URL = 'https://api.spoonacular.com/recipes';
const JSON_SERVER_URL = 'http://localhost:3001';

// Check if we've reached API limit
const checkAPILimit = async () => {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/apiUsageStats`);
    const stats = await response.json();
    
    const today = new Date().toDateString();
    if (stats.date === today) {
      return stats.count < stats.limit;
    }
    
    // Reset counter for new day
    await fetch(`${JSON_SERVER_URL}/apiUsageStats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        date: today,
        count: 0,
        limit: 150,
        lastReset: new Date().toISOString()
      })
    });
    
    return true;
  } catch (error) {
    console.error('Error checking API limit:', error);
    return false;
  }
};

// Increment API usage counter
const incrementAPIUsage = async () => {
  try {
    const response = await fetch(`${JSON_SERVER_URL}/apiUsageStats`);
    const stats = await response.json();
    
    await fetch(`${JSON_SERVER_URL}/apiUsageStats`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...stats,
        count: stats.count + 1
      })
    });
  } catch (error) {
    console.error('Error updating API usage:', error);
  }
};

// Cache recipe to JSON Server
const cacheRecipe = async (recipe) => {
  try {
    // Check if recipe already cached
    const existing = await fetch(`${JSON_SERVER_URL}/cachedRecipes?id=${recipe.id}`);
    const existingRecipes = await existing.json();
    
    if (existingRecipes.length === 0) {
      // Add to cache
      await fetch(`${JSON_SERVER_URL}/cachedRecipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipe,
          cachedAt: new Date().toISOString()
        })
      });
      console.log(`Cached recipe: ${recipe.title}`);
    }
  } catch (error) {
    console.error('Error caching recipe:', error);
  }
};

// Get cached recipes from JSON Server
const getCachedRecipes = async (query = '') => {
  try {
    let url = `${JSON_SERVER_URL}/cachedRecipes`;
    if (query) {
      // Simple search in title
      const response = await fetch(url);
      const allRecipes = await response.json();
      return allRecipes.filter(recipe => 
        recipe.title && recipe.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error getting cached recipes:', error);
    return [];
  }
};

// Enhanced Recipe API
export const recipeAPI = {
  // Get random recipe (shows different recipe each refresh)
  getRandomRecipe: async (alwaysRandom = true) => {
    try {
      // If alwaysRandom is false, use the old daily cache behavior
      if (!alwaysRandom) {
        const today = new Date().toDateString();
        const dailyResponse = await fetch(`${JSON_SERVER_URL}/dailyRecipes/1`);
        const dailyData = await dailyResponse.json();
        
        if (dailyData.date === today && dailyData.recipe) {
          console.log('Using cached Recipe of the Day');
          return dailyData.recipe;
        }
      }

      // Check API limit
      const canUseAPI = await checkAPILimit() && API_KEY !== 'YOUR_SPOONACULAR_API_KEY';
      
      if (canUseAPI) {
        // Try to get from Spoonacular
        const url = `${SPOONACULAR_URL}/random?apiKey=${API_KEY}&number=1&includeNutrition=true`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const recipe = data.recipes[0];
          
          // Cache the recipe
          await cacheRecipe(recipe);
          
          await incrementAPIUsage();
          return recipe;
        }
      }
      
      // Fallback to cached recipes - get random one each time
      console.log('Using random cached recipe');
      const cachedRecipes = await getCachedRecipes();
      if (cachedRecipes.length > 0) {
        // Filter out recipes with null values
        const validRecipes = cachedRecipes.filter(recipe => 
          recipe && recipe.id && recipe.title
        );
        
        if (validRecipes.length > 0) {
          // Return a different random cached recipe each time
          const randomIndex = Math.floor(Math.random() * validRecipes.length);
          return validRecipes[randomIndex];
        }
      }
      
      // If no cached recipes, return null
      return null;
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      // Try to return random cached recipe
      const cachedRecipes = await getCachedRecipes();
      const validRecipes = cachedRecipes.filter(recipe => 
        recipe && recipe.id && recipe.title
      );
      return validRecipes.length > 0 ? 
        validRecipes[Math.floor(Math.random() * validRecipes.length)] : null;
    }
  },

  // Search recipes
  searchRecipes: async (query, number = 12) => {
    try {
      const canUseAPI = await checkAPILimit() && API_KEY !== 'YOUR_SPOONACULAR_API_KEY';
      
      if (canUseAPI) {
        // Try Spoonacular API
        const url = `${SPOONACULAR_URL}/complexSearch?apiKey=${API_KEY}&query=${query}&number=${number}&addRecipeInformation=true&addRecipeNutrition=true`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache all results
          for (const recipe of data.results) {
            await cacheRecipe(recipe);
          }
          
          await incrementAPIUsage();
          return data.results;
        }
      }
      
      // Fallback to cached recipes
      console.log('Searching in cached recipes');
      return await getCachedRecipes(query);
    } catch (error) {
      console.error('Error searching recipes:', error);
      return await getCachedRecipes(query);
    }
  },

  // Get recipe by ID
  getRecipeById: async (id) => {
    try {
      // First check cache
      const cachedResponse = await fetch(`${JSON_SERVER_URL}/cachedRecipes?id=${id}`);
      const cachedRecipes = await cachedResponse.json();
      
      if (cachedRecipes.length > 0) {
        console.log('Using cached recipe details');
        return cachedRecipes[0];
      }
      
      const canUseAPI = await checkAPILimit() && API_KEY !== 'YOUR_SPOONACULAR_API_KEY';
      
      if (canUseAPI) {
        // Try Spoonacular API
        const url = `${SPOONACULAR_URL}/${id}/information?apiKey=${API_KEY}&includeNutrition=true`;
        const response = await fetch(url);
        
        if (response.ok) {
          const recipe = await response.json();
          await cacheRecipe(recipe);
          await incrementAPIUsage();
          return recipe;
        }
      }
      
      // If not found, return null
      return null;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  },

  // Advanced search with multiple filters
  advancedSearch: async (params) => {
    try {
      const canUseAPI = await checkAPILimit() && API_KEY !== 'YOUR_SPOONACULAR_API_KEY';
      
      if (canUseAPI) {
        // Build query string for Spoonacular complex search
        let url = `${SPOONACULAR_URL}/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&addRecipeNutrition=true`;
        
        // Add all parameters to URL
        Object.keys(params).forEach(key => {
          if (params[key] && params[key] !== '') {
            // Special handling for certain parameters
            if (key === 'number') {
              url += `&${key}=${params[key]}`;
            } else if (key === 'diet' || key === 'intolerances') {
              // These should be comma-separated strings
              url += `&${key}=${params[key]}`;
            } else {
              url += `&${key}=${encodeURIComponent(params[key])}`;
            }
          }
        });
        
        console.log('Advanced search URL:', url);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          // Cache all results
          for (const recipe of data.results) {
            await cacheRecipe(recipe);
          }
          
          await incrementAPIUsage();
          return data.results;
        }
      }
      
      // Fallback to cached recipes with basic filtering
      console.log('Advanced search using cached recipes');
      const cachedRecipes = await getCachedRecipes();
      
      // Basic filtering on cached recipes
      let filteredRecipes = cachedRecipes.filter(recipe => 
        recipe && recipe.id && recipe.title
      );
      
      // Filter by query if provided
      if (params.query) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.title.toLowerCase().includes(params.query.toLowerCase())
        );
      }
      
      // Filter by max ready time if provided
      if (params.maxReadyTime) {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.readyInMinutes && recipe.readyInMinutes <= parseInt(params.maxReadyTime)
        );
      }
      
      // Filter by diets if provided (basic check in title/summary)
      if (params.diet) {
        const diets = params.diet.toLowerCase().split(',');
        filteredRecipes = filteredRecipes.filter(recipe => {
          const text = `${recipe.title} ${recipe.summary || ''}`.toLowerCase();
          return diets.some(diet => {
            if (diet === 'vegetarian') return recipe.vegetarian === true;
            if (diet === 'vegan') return recipe.vegan === true;
            if (diet === 'glutenfree') return recipe.glutenFree === true;
            if (diet === 'dairyfree') return recipe.dairyFree === true;
            return text.includes(diet);
          });
        });
      }
      
      // Limit results
      const limit = params.number || 12;
      return filteredRecipes.slice(0, limit);
    } catch (error) {
      console.error('Error in advanced search:', error);
      return [];
    }
  },
  getAPIUsageStats: async () => {
    try {
      const response = await fetch(`${JSON_SERVER_URL}/apiUsageStats`);
      if (response.ok) {
        return await response.json();
      }
      return { count: 0, limit: 150, date: '' };
    } catch (error) {
      console.error('Error getting API stats:', error);
      return { count: 0, limit: 150, date: '' };
    }
  },

  // Get all cached recipes
  getCachedRecipes: async () => {
    return await getCachedRecipes();
  },

  // Clear cache (admin function)
  clearCache: async () => {
    try {
      const response = await fetch(`${JSON_SERVER_URL}/cachedRecipes`);
      const recipes = await response.json();
      
      // Delete each cached recipe
      for (const recipe of recipes) {
        await fetch(`${JSON_SERVER_URL}/cachedRecipes/${recipe.id}`, {
          method: 'DELETE'
        });
      }
      
      console.log('Cache cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return { success: false };
    }
  }
};

export const isAPIConfigured = () => {
  return API_KEY !== 'YOUR_SPOONACULAR_API_KEY';
};