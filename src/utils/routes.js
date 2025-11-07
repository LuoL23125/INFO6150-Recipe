// Route configuration file
// Centralized place to manage all routes in the application

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RECIPE_DETAILS: '/recipe/:id',
  USER_DASHBOARD: '/dashboard',
  USER_PROFILE: '/profile',
  ADD_RECIPE: '/add-recipe',
  EDIT_RECIPE: '/edit-recipe/:id',
  SEARCH: '/search',
  CATEGORY: '/category/:name',
  FAVORITES: '/favorites',
  ADMIN: '/admin'
};

// Route groups for authentication
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.RECIPE_DETAILS,
  ROUTES.SEARCH,
  ROUTES.CATEGORY
];

export const PRIVATE_ROUTES = [
  ROUTES.USER_DASHBOARD,
  ROUTES.USER_PROFILE,
  ROUTES.ADD_RECIPE,
  ROUTES.EDIT_RECIPE,
  ROUTES.FAVORITES
];

export const ADMIN_ROUTES = [
  ROUTES.ADMIN
];