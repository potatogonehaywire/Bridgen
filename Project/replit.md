# Overview

Bridgen is an intergenerational community platform that connects seniors and teens (14+) through shared learning experiences. The application features a Pac-Man-inspired arcade theme designed to bridge the generational gap while maintaining accessibility for seniors. The platform facilitates mentorship circles, skill swaps, storytelling, collaborative projects, workshops, and social spaces for meaningful cross-generational connections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React and TypeScript using Vite as the build tool. The application follows a component-based architecture with:

- **UI Framework**: React with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with custom CSS variables for theming, including arcade-inspired color schemes
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent, accessible UI elements
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized production builds

The design system implements a Pac-Man arcade theme with:
- Custom color palette including pac-yellow, arcade-blue, ghost-orange, and cherry-red
- Arcade font family using "Press Start 2P" for headings
- High contrast mode for accessibility
- Responsive design with mobile-first approach

## Backend Architecture

The backend follows a REST API pattern built with:

- **Framework**: Express.js with TypeScript for type-safe server development
- **Database Layer**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Middleware**: Express middlewares for JSON parsing, URL encoding, and request logging
- **Development**: Hot reloading with Vite integration for seamless development experience

The server implements a layered architecture with:
- Route handlers in `/server/routes.ts`
- Storage abstraction in `/server/storage.ts`
- Database schema definitions in `/shared/schema.ts`

## Data Storage Solutions

The application uses PostgreSQL as the primary database with:

- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Connection**: @neondatabase/serverless for optimized serverless connections
- **Schema Management**: Centralized schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migration management

Current schema includes user management with username/password authentication.

## Authentication and Authorization

The system implements a basic authentication structure with:

- User registration and login capabilities
- Session-based authentication (referenced in package dependencies)
- Password-based authentication with secure storage
- User profile management with customizable avatars and skills

## External Dependencies

The application integrates several external services and libraries:

- **Database**: Neon Database for serverless PostgreSQL hosting
- **UI Components**: Extensive Radix UI component library for accessible primitives
- **Fonts**: Google Fonts for typography (Press Start 2P for arcade theme)
- **Development Tools**: Replit-specific plugins for development environment integration
- **Form Handling**: React Hook Form with Hookform resolvers for form validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Carousel**: Embla Carousel for interactive UI elements

The platform is designed to be deployment-ready with support for multiple platforms including mobile apps (iOS/Android) and desktop applications (Windows/macOS), though these are currently UI mockups in the frontend.