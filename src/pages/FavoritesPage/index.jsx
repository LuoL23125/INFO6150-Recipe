import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// This page redirects to the profile page with favorites tab selected
const FavoritesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to profile page, favorites tab
    navigate('/profile');
  }, [navigate]);

  return null;
};

export default FavoritesPage;