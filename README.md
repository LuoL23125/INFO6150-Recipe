# 🍳 Delicious Recipes Website

A modern recipe-sharing platform built with React and Material-UI, supporting user authentication, recipe search, and favorites management.

## 🚀 Quick Start

### 1. Install the Project

```
npm install
```

### 2. Configure the API (Optional)

Create a `.env` file in the root directory:

```
VITE_SPOONACULAR_API_KEY=your_api_key
```

> Tip: You can still use the project without an API key — demo data will be displayed instead!

### 3. Start the Project

```
npm run dev:all
```

Access:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📱 Features

### Guest Features

- 🔍 Search recipes
- 📖 View recipe details

### User Features

- 🔐 Register / Login
- ❤️ Save favorite recipes
- 👤 Manage personal profile
- 📊 Manage favorites list

## 🔑 Test Account

```
Email: demo@example.com
Password: demo123
```

## 📁 Project Structure

```
src/
├── components/     # Components
├── pages/          # Pages
├── services/       # Services
├── utils/          # Utilities
└── App.jsx         # Main application
```

## 🛠️ Common Commands

```
npm run dev        # Start frontend
npm run server     # Start backend
npm run dev:all    # Start both frontend and backend
npm run build      # Build the project
```

## 🐛 Common Issues

### API Limitations

- Free version: 150 requests per day
- When the limit is reached, cached data will be used

## 📝 Author

INFO6150 Course Project