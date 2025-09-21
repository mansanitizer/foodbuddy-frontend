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

Create a `.env` file in the root directory:

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

The frontend communicates with the FoodBuddy backend API. Make sure the backend is running on the configured API base URL.

## Deployment

This frontend is configured for deployment on Vercel, Netlify, or any static hosting service.