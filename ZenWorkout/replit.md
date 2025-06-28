# ZenGym - Mobile Fitness PWA

## Overview

ZenGym is a mobile-first Progressive Web Application (PWA) designed as a fitness companion. It provides workout routine management, session tracking, daily affirmations, and motivational features. The application follows a modern full-stack architecture with React frontend, Express backend, and PostgreSQL database integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom ZenGym color scheme
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker for offline functionality and app-like experience

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database Integration**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect and secure session management
- **Storage**: Database-backed storage with user isolation and data persistence
- **API Design**: Protected RESTful endpoints with authentication middleware

### Mobile-First Design
- **Progressive Web App**: Installable with offline capabilities
- **Responsive Design**: Optimized for mobile devices with max-width container
- **Touch-Friendly**: Large buttons and intuitive navigation
- **Notification System**: Browser notifications with fallback to in-app toasts

## Key Components

### Database Schema
- **Users**: Replit Auth integration with email, profile info, and timestamps
- **Sessions**: Secure session storage for authentication state
- **Workout Routines**: Custom exercise routines with duration and exercise lists
- **Workout Sessions**: Tracking completed workouts with timestamps
- **User Settings**: Preferences for notifications, reminders, theme, Pro status, and AI usage tracking
- **Affirmation History**: Daily motivation tracking

### Core Features
- **Dashboard**: Statistics display, daily affirmations, quick workout access, Pro upgrade prompts
- **Routine Management**: CRUD operations for custom workout routines
- **Session Tracking**: Timer-based workout recording with progress tracking
- **Settings Panel**: User preferences, notification controls, and Pro subscription management
- **Theme System**: Light/dark mode toggle with system preference detection
- **ZenGym Pro**: Premium subscription at $7.99/month with curated meal plans, calorie tracker, premium routines
- **AI Chat Assistant**: "Ask Zen" feature for fitness/nutrition questions with usage limits and OpenAI integration

### PWA Capabilities
- **Service Worker**: Caching strategies for offline functionality
- **Web App Manifest**: Installation prompts and app-like behavior
- **Background Sync**: Offline workout session synchronization
- **Push Notifications**: Workout reminders and daily affirmations

## Data Flow

1. **User Interaction**: Mobile-optimized interface captures user actions
2. **State Management**: TanStack Query manages server state with optimistic updates
3. **API Communication**: RESTful endpoints handle CRUD operations
4. **Data Storage**: Drizzle ORM interfaces with PostgreSQL database
5. **Offline Support**: Service worker caches data for offline functionality
6. **Notification System**: Browser APIs deliver timely workout reminders

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database ORM
- **@radix-ui/react-***: Accessible UI component primitives
- **wouter**: Lightweight routing solution
- **date-fns**: Date manipulation utilities

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development with auto-reload
- **Port Configuration**: Server runs on port 5000 with proper CORS handling
- **Hot Module Replacement**: Vite development server with instant updates

### Production Build
- **Static Assets**: Vite builds optimized client bundle to dist/public
- **Server Bundle**: ESBuild compiles server to single dist/index.js file
- **Database Migrations**: Drizzle Kit handles schema migrations
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Replit Deployment
- **Autoscale Target**: Configured for automatic scaling
- **Build Process**: npm run build compiles both client and server
- **Start Command**: npm run start serves production build
- **Module System**: ES modules throughout with proper imports

## Changelog

```
Changelog:
- June 19, 2025. Initial ZenGym setup with workout tracking, routines, and PWA features
- June 19, 2025. Added ZenGym Pro subscription ($7.99/month) with upgrade modals and premium features
- June 19, 2025. Integrated AI Chat Assistant "Ask Zen" with OpenAI API and intelligent fallback responses
- June 19, 2025. Implemented usage limits: 3 daily questions for free users, unlimited for Pro users
- June 19, 2025. Integrated Replit Auth with PostgreSQL database backend and secure authentication flow
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```