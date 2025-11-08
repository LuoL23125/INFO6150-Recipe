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
        recipe.title.toLowerCase().includes(query.toLowerCase())
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
  // Get random recipe (Recipe of the Day)
  getRandomRecipe: async (forceRefresh = false) => {
    try {
      // Check if we have today's recipe cached
      const today = new Date().toDateString();
      const dailyResponse = await fetch(`${JSON_SERVER_URL}/dailyRecipes/1`);
      const dailyData = await dailyResponse.json();
      
      if (!forceRefresh && dailyData.date === today && dailyData.recipe) {
        console.log('Using cached Recipe of the Day');
        return dailyData.recipe;
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
          
          // Update daily recipe
          await fetch(`${JSON_SERVER_URL}/dailyRecipes/1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: 1,
              date: today,
              recipe: recipe,
              lastUpdated: new Date().toISOString()
            })
          });
          
          await incrementAPIUsage();
          return recipe;
        }
      }
      
      // Fallback to cached recipes
      console.log('API limit reached or unavailable, using cached recipes');
      const cachedRecipes = await getCachedRecipes();
      if (cachedRecipes.length > 0) {
        // Return a random cached recipe
        const randomIndex = Math.floor(Math.random() * cachedRecipes.length);
        return cachedRecipes[randomIndex];
      }
      
      // Last resort: return mock data
      return mockData.randomRecipe;
    } catch (error) {
      console.error('Error fetching random recipe:', error);
      // Try to return cached recipe
      const cachedRecipes = await getCachedRecipes();
      return cachedRecipes[0] || mockData.randomRecipe;
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
      
      // If not found, return mock
      return mockData.randomRecipe;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return mockData.randomRecipe;
    }
  },

  // Get API usage statistics
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

// Mock data for development
const mockData = {
  randomRecipe: {
    id: 1,
    title: "Classic Spaghetti Carbonara",
    readyInMinutes: 30,
    servings: 4,
    image: "https://via.placeholder.com/556x370",
    summary: "A classic Italian pasta dish with eggs, cheese, and bacon.",
    instructions: "<ol><li>Cook spaghetti according to package directions.</li><li>Meanwhile, cook bacon until crispy.</li><li>Beat eggs with cheese.</li><li>Drain pasta and mix with bacon.</li><li>Remove from heat and quickly stir in egg mixture.</li><li>Season with pepper and serve immediately.</li></ol>",
    extendedIngredients: [
      { id: 1, original: "400g spaghetti" },
      { id: 2, original: "200g bacon, diced" },
      { id: 3, original: "4 large eggs" },
      { id: 4, original: "100g Parmesan cheese, grated" },
      { id: 5, original: "Black pepper to taste" }
    ],
    nutrition: {
      nutrients: [
        { name: "Calories", amount: 450, unit: "kcal", percentOfDailyNeeds: 22.5 },
        { name: "Protein", amount: 25, unit: "g", percentOfDailyNeeds: 50 },
        { name: "Fat", amount: 18, unit: "g", percentOfDailyNeeds: 27.7 },
        { name: "Carbohydrates", amount: 45, unit: "g", percentOfDailyNeeds: 15 }
      ]
    }
  }
};

export const isAPIConfigured = () => {
  return API_KEY !== 'YOUR_SPOONACULAR_API_KEY';
};