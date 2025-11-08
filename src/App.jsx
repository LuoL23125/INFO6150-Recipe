import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Import components
import NavigationBar from './components/NavigationBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import DashboardPage from './pages/DashboardPage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green theme - matching login/register pages
    },
    secondary: {
      main: '#ff6f00', // Orange secondary color
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <NavigationBar />
          
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recipe/:id" element={<RecipeDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/add-recipe" element={<AddRecipePage />} />
              <Route path="/edit-recipe/:id" element={<EditRecipePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;