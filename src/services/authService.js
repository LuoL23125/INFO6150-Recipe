// Authentication Service for handling user registration, login, and session management

const API_URL = 'http://localhost:3001';

// Simple hash function for demo (in production, use bcrypt on backend)
const hashPassword = (password) => {
  return btoa(password); // Base64 encoding for demo
};

const verifyPassword = (password, hashedPassword) => {
  return btoa(password) === hashedPassword;
};

class AuthService {
  constructor() {
    this.currentUser = this.loadUser();
  }

  // Load user from localStorage
  loadUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user data');
        return null;
      }
    }
    return null;
  }

  // Save user to localStorage
  saveUser(user) {
    // Don't save password in localStorage
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    this.currentUser = userWithoutPassword;
  }

  // Clear user from localStorage
  clearUser() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
  }

  // Register new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUsers = await fetch(`${API_URL}/users?email=${userData.email}`);
      const users = await existingUsers.json();
      
      if (users.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Create new user object
      const newUser = {
        ...userData,
        password: hashPassword(userData.password),
        name: `${userData.firstName} ${userData.lastName}`,
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      // Remove confirmPassword field
      delete newUser.confirmPassword;

      // Save to JSON Server
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const createdUser = await response.json();
      
      // Auto login after registration
      this.saveUser(createdUser);
      
      return {
        success: true,
        user: createdUser,
        message: 'Registration successful!'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Fetch user by email
      const response = await fetch(`${API_URL}/users?email=${email}`);
      const users = await response.json();

      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = users[0];

      // Verify password
      if (!verifyPassword(password, user.password)) {
        throw new Error('Invalid email or password');
      }

      // Save user session
      this.saveUser(user);

      return {
        success: true,
        user: user,
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Logout user
  logout() {
    this.clearUser();
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  // Check if user is logged in
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      // Don't allow password updates through this method
      delete updates.password;
      delete updates.id;

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      this.saveUser(updatedUser);

      return {
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message || 'Profile update failed'
      };
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // First verify current password
      const response = await fetch(`${API_URL}/users/${userId}`);
      const user = await response.json();

      if (!verifyPassword(currentPassword, user.password)) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const updateResponse = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: hashPassword(newPassword)
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Password update failed');
      }

      return {
        success: true,
        message: 'Password changed successfully!'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: error.message || 'Password change failed'
      };
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;