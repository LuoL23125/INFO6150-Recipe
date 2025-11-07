import React, { useState } from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const SearchBar = ({ onSearch, placeholder = "Search recipes..." }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        boxShadow: 2
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, px: 1 }}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        inputProps={{ 'aria-label': 'search recipes' }}
      />
      {searchTerm && (
        <IconButton onClick={handleClear} aria-label="clear">
          <Clear />
        </IconButton>
      )}
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
    </Paper>
  );
};

export default SearchBar;