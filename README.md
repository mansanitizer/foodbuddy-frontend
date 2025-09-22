# FoodBuddy Frontend

A modern React + TypeScript frontend for the FoodBuddy meal tracking application.

## Features

- 🍎 Modern dark theme UI
- 📱 Mobile-first responsive design
- 🥗 Meal tracking with image upload
- 📊 Real-time macro calculations
- 👥 Buddy system for accountability
- 📈 Analytics and progress tracking

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3030`

### Build

```bash
npm run build
```

Build artifacts will be in the `dist/` directory.

## Environment Variables

The frontend is configured to work with the production backend by default. For local development, create a `.env` file in the root directory:

### Production (Default)
No configuration needed - uses the hosted backend at:
```env
VITE_API_BASE_URL=https://api.foodbuddy.iarm.me
```

### Local Development
Create a `.env` file for local backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── lib/           # Utility functions
├── assets/        # Static assets
└── App.tsx        # Main app component
```

## API Integration

The frontend communicates with the FoodBuddy backend API.

- **Production**: Uses the hosted backend at `https://api.foodbuddy.iarm.me`
- **Development**: Use a `.env` file to configure local backend URL (see Environment Variables section)

## Deployment

This frontend is configured for deployment on Vercel, Netlify, or any static hosting service.