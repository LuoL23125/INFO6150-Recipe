// Favorites Service for managing user's favorite recipes

const API_URL = 'http://localhost:3001';

class FavoritesService {
  // Check if a recipe is favorited by the current user
  async isFavorited(userId, recipeId) {
    try {
      const response = await fetch(
        `${API_URL}/favorites?userId=${userId}&recipeId=${recipeId}`
      );
      const favorites = await response.json();
      return favorites.length > 0 ? favorites[0] : null;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return null;
    }
  }

  // Add a recipe to favorites
  async addFavorite(userId, recipe) {
    try {
      // Check if already favorited
      const existing = await this.isFavorited(userId, recipe.id);
      if (existing) {
        return {
          success: false,
          message: 'Recipe already in favorites',
          favorite: existing
        };
      }

      // Add to favorites
      const response = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          summary: recipe.summary?.substring(0, 200) || '',
          addedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      const favorite = await response.json();
      
      return {
        success: true,
        message: 'Recipe added to favorites!',
        favorite: favorite
      };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return {
        success: false,
        message: 'Failed to add recipe to favorites'
      };
    }
  }

  // Remove a recipe from favorites
  async removeFavorite(userId, recipeId) {
    try {
      // Find the favorite entry
      const existing = await this.isFavorited(userId, recipeId);
      if (!existing) {
        return {
          success: false,
          message: 'Recipe not in favorites'
        };
      }

      // Delete from favorites
      const response = await fetch(`${API_URL}/favorites/${existing.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      return {
        success: true,
        message: 'Recipe removed from favorites'
      };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return {
        success: false,
        message: 'Failed to remove recipe from favorites'
      };
    }
  }

  // Get all favorites for a user
  async getUserFavorites(userId) {
    try {
      const response = await fetch(`${API_URL}/favorites?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId, recipe) {
    const existing = await this.isFavorited(userId, recipe.id);
    
    if (existing) {
      return await this.removeFavorite(userId, recipe.id);
    } else {
      return await this.addFavorite(userId, recipe);
    }
  }

  // Sync local storage favorites to server (for migration)
  async syncLocalFavorites(userId) {
    try {
      // Get local storage favorites
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (localFavorites.length === 0) {
        return { success: true, synced: 0 };
      }

      let syncedCount = 0;
      
      for (const recipe of localFavorites) {
        const existing = await this.isFavorited(userId, recipe.id);
        if (!existing) {
          await this.addFavorite(userId, recipe);
          syncedCount++;
        }
      }

      // Clear local storage favorites after syncing
      localStorage.removeItem('favorites');
      
      return {
        success: true,
        synced: syncedCount,
        message: `Synced ${syncedCount} favorites to your account`
      };
    } catch (error) {
      console.error('Error syncing favorites:', error);
      return {
        success: false,
        synced: 0,
        message: 'Failed to sync favorites'
      };
    }
  }

  // Get favorite count for a user
  async getFavoriteCount(userId) {
    try {
      const favorites = await this.getUserFavorites(userId);
      return favorites.length;
    } catch (error) {
      return 0;
    }
  }
}

// Create singleton instance
const favoritesService = new FavoritesService();
export default favoritesService;