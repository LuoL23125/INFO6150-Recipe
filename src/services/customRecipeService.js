// Custom Recipe Service for managing user's custom recipes
// src/services/customRecipeService.js

const API_URL = 'http://localhost:3001';

class CustomRecipeService {
  // Create a new custom recipe
  async createRecipe(userId, recipeData) {
    try {
      // 确保 userId 是数字类型
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      console.log('Creating recipe with userId:', numericUserId, 'Type:', typeof numericUserId);

      const newRecipe = {
        ...recipeData,
        userId: numericUserId, // 使用数字类型的 userId
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: Date.now() // Simple ID generation
      };

      console.log('Recipe data to save:', newRecipe);

      const response = await fetch(`${API_URL}/customRecipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecipe)
      });

      if (!response.ok) {
        throw new Error('Failed to create recipe');
      }

      const recipe = await response.json();
      console.log('Recipe created successfully:', recipe);
      
      return {
        success: true,
        recipe: recipe,
        message: 'Recipe created successfully!'
      };
    } catch (error) {
      console.error('Error creating recipe:', error);
      return {
        success: false,
        message: 'Failed to create recipe'
      };
    }
  }

  // Update an existing custom recipe
  async updateRecipe(recipeId, userId, updates) {
    try {
      // 确保 userId 是数字类型
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      // First check if the recipe belongs to the user
      const checkResponse = await fetch(`${API_URL}/customRecipes/${recipeId}`);
      if (!checkResponse.ok) {
        throw new Error('Recipe not found');
      }
      
      const existingRecipe = await checkResponse.json();
      
      // 比较时也要确保类型一致
      if (existingRecipe.userId !== numericUserId) {
        console.error('Authorization failed:', existingRecipe.userId, '!==', numericUserId);
        throw new Error('Unauthorized to edit this recipe');
      }

      const updatedRecipe = {
        ...existingRecipe,
        ...updates,
        userId: numericUserId, // 保持 userId 为数字
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/customRecipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecipe)
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      const recipe = await response.json();
      
      return {
        success: true,
        recipe: recipe,
        message: 'Recipe updated successfully!'
      };
    } catch (error) {
      console.error('Error updating recipe:', error);
      return {
        success: false,
        message: error.message || 'Failed to update recipe'
      };
    }
  }

  // Get all recipes for a specific user
  async getUserRecipes(userId) {
    try {
      // 确保 userId 是数字类型
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      console.log('Fetching recipes for userId:', numericUserId);
      
      const response = await fetch(`${API_URL}/customRecipes?userId=${numericUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const recipes = await response.json();
      console.log('Fetched recipes:', recipes);
      return recipes;
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      return [];
    }
  }

  // Get a single recipe by ID
  async getRecipeById(recipeId) {
    try {
      const response = await fetch(`${API_URL}/customRecipes/${recipeId}`);
      if (!response.ok) {
        throw new Error('Recipe not found');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }
  }

  // Delete a custom recipe
  async deleteRecipe(recipeId, userId) {
    try {
      // 确保 userId 是数字类型
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      // First check if the recipe belongs to the user
      const checkResponse = await fetch(`${API_URL}/customRecipes/${recipeId}`);
      if (!checkResponse.ok) {
        throw new Error('Recipe not found');
      }
      
      const existingRecipe = await checkResponse.json();
      if (existingRecipe.userId !== numericUserId) {
        throw new Error('Unauthorized to delete this recipe');
      }

      const response = await fetch(`${API_URL}/customRecipes/${recipeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      return {
        success: true,
        message: 'Recipe deleted successfully!'
      };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete recipe'
      };
    }
  }

  // Get all public recipes (for future feature)
  async getPublicRecipes() {
    try {
      const response = await fetch(`${API_URL}/customRecipes?isPublic=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch public recipes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching public recipes:', error);
      return [];
    }
  }

  // Search custom recipes
  async searchRecipes(userId, query) {
    try {
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      const recipes = await this.getUserRecipes(numericUserId);
      
      return recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        (recipe.description && recipe.description.toLowerCase().includes(query.toLowerCase())) ||
        (recipe.ingredients && recipe.ingredients.some(ing => 
          ing.toLowerCase().includes(query.toLowerCase())
        )) ||
        (recipe.tags && recipe.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        ))
      );
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  }
}

// Create singleton instance
const customRecipeService = new CustomRecipeService();
export default customRecipeService;