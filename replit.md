# FarmConnect

## Overview

FarmConnect is a mobile-first React web application that directly connects farmers with customers for agricultural produce sales. The platform eliminates middlemen by allowing farmers to list their crops with photos, location, and pricing, while customers can browse, search, and purchase fresh produce directly from local farmers. The application features multi-language support (English, Hindi, Punjabi), real-time messaging, location-based crop discovery, and integrated payment processing through Stripe.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 with TypeScript**: Component-based architecture using React hooks and functional components
- **Wouter**: Lightweight client-side routing for single-page navigation
- **shadcn/ui + Radix UI**: Comprehensive component library providing accessible, customizable UI components
- **TailwindCSS**: Utility-first CSS framework with custom design tokens and mobile-first responsive design
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form + Zod**: Form management with schema-based validation
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces

### Backend Architecture
- **Express.js**: RESTful API server with middleware for authentication, logging, and error handling
- **WebSocket Integration**: Real-time messaging capabilities using native WebSocket API
- **JWT Authentication**: Stateless authentication with Bearer token strategy
- **bcrypt**: Password hashing for secure user credential storage
- **Role-Based Access**: Separate authentication flows and permissions for farmers and customers

### Database & ORM
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect
- **PostgreSQL**: Relational database with support for JSON columns for flexible data storage
- **Database Schema**: Comprehensive schema covering users, farmers, customers, crops, messages, orders, and reviews
- **Neon Database**: Serverless PostgreSQL with connection pooling

### Payment Processing
- **Stripe Integration**: Secure payment processing with React Stripe.js components
- **Payment Element**: Modern, customizable payment form with multiple payment methods
- **Customer Management**: Stripe customer creation and management for both farmers and customers

### Authentication & Security
- **Multi-Step Registration**: Separate onboarding flows for farmers (with Kissan card verification) and customers
- **Phone-Based Authentication**: Primary authentication method using phone numbers
- **Password Security**: bcrypt hashing with salt rounds for password protection
- **Route Protection**: Middleware-based authentication checks for protected endpoints

### Real-Time Features
- **WebSocket Messaging**: Bi-directional communication for real-time chat between farmers and customers
- **Live Notifications**: Unread message counts and real-time updates
- **Connection Management**: Automatic reconnection and error handling for WebSocket connections

### Internationalization
- **Multi-Language Support**: Built-in support for English, Hindi, and Punjabi
- **Voice Assistance**: Text-to-speech capabilities for accessibility and language support
- **Cultural Adaptation**: Language-specific UI elements and cultural considerations

### File Upload & Media
- **Camera Integration**: Native camera access for crop photography
- **Image Storage**: Support for multiple crop images with JSON array storage
- **Location Services**: Geolocation API integration for location-based crop discovery

## External Dependencies

### Third-Party Services
- **Stripe**: Payment processing and subscription management
- **Neon Database**: Serverless PostgreSQL hosting
- **Web APIs**: Camera, Geolocation, Speech Synthesis, and WebSocket APIs

### Key Libraries
- **@stripe/stripe-js & @stripe/react-stripe-js**: Stripe payment integration
- **@neondatabase/serverless**: Neon database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **ws**: WebSocket server implementation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **TailwindCSS**: Utility-first styling
- **PostCSS**: CSS processing and autoprefixing
- **ESBuild**: Fast JavaScript bundling for production