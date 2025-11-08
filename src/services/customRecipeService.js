// src/services/customRecipeService.js
// Custom Recipe Service for managing user's custom recipes

const API_URL = 'http://localhost:3001';

class CustomRecipeService {
  // Create a new custom recipe
  async createRecipe(userId, recipeData) {
    try {
      // 统一把 userId 存成字符串，避免 "1" 和 1 不相等的问题
      const stringUserId = String(userId);
      console.log(
        'Creating recipe with userId:',
        stringUserId,
        'Type:',
        typeof stringUserId
      );

      const newRecipe = {
        ...recipeData,
        userId: stringUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: Date.now() // 简单的 ID 生成
      };

      console.log('Recipe data to save:', newRecipe);

      const response = await fetch(`${API_URL}/customRecipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
        recipe,
        message: 'Recipe created successfully!'
      };
    } catch (error) {
      console.error('Error creating recipe:', error);
      return {
        success: false,
        message: error.message || 'Failed to create recipe'
      };
    }
  }

  // Update an existing custom recipe
  async updateRecipe(recipeId, userId, updates) {
    try {
      const stringUserId = String(userId);

      // 先检查这道菜是不是当前用户的
      const checkResponse = await fetch(
        `${API_URL}/customRecipes/${recipeId}`
      );
      if (!checkResponse.ok) {
        throw new Error('Recipe not found');
      }

      const existingRecipe = await checkResponse.json();

      if (String(existingRecipe.userId) !== stringUserId) {
        console.error(
          'Authorization failed:',
          existingRecipe.userId,
          '!==',
          stringUserId
        );
        throw new Error('Unauthorized to edit this recipe');
      }

      const updatedRecipe = {
        ...existingRecipe,
        ...updates,
        userId: stringUserId,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/customRecipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRecipe)
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      const recipe = await response.json();

      return {
        success: true,
        recipe,
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
      const stringUserId = String(userId);
      console.log('Fetching recipes for userId:', stringUserId, 'Type: string');

      const response = await fetch(
        `${API_URL}/customRecipes?userId=${encodeURIComponent(stringUserId)}`
      );
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

  // ❗ Get a single recipe by ID —— 改成用 ?id= 查询，避免 /:id 404 的问题
  async getRecipeById(recipeId) {
    try {
      const idString = String(recipeId).trim();
      console.log('getRecipeById – querying with id:', idString);

      // 不再用 /customRecipes/:id，而是用 ?id= 精确过滤
      const response = await fetch(
        `${API_URL}/customRecipes?id=${encodeURIComponent(idString)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const data = await response.json();
      console.log('getRecipeById – response data:', data);

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Recipe not found');
      }

      return data[0]; // 取第一条匹配的记录
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }
  }

  // Delete a custom recipe
  async deleteRecipe(recipeId, userId) {
    try {
      const stringUserId = String(userId);

      const checkResponse = await fetch(
        `${API_URL}/customRecipes/${recipeId}`
      );
      if (!checkResponse.ok) {
        throw new Error('Recipe not found');
      }

      const existingRecipe = await checkResponse.json();
      if (String(existingRecipe.userId) !== stringUserId) {
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
      const stringUserId = String(userId);
      const recipes = await this.getUserRecipes(stringUserId);

      return recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        (recipe.description &&
          recipe.description.toLowerCase().includes(query.toLowerCase())) ||
        (recipe.ingredients &&
          recipe.ingredients.some((ing) =>
            ing.toLowerCase().includes(query.toLowerCase())
          )) ||
        (recipe.tags &&
          recipe.tags.some((tag) =>
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
