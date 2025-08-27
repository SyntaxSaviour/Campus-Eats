# CampusEats - Campus Food Delivery Platform

## Overview

CampusEats is a full-stack food delivery application specifically designed for college campuses. The platform connects students with campus restaurants, enabling easy food ordering and delivery. The application features separate interfaces for students (ordering food) and restaurant owners (managing menus and orders), with a focus on campus-specific features like student ID verification and campus location tracking.

The project is built as a monorepo with a React frontend, Express backend, and PostgreSQL database, all designed to work seamlessly in a campus environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Hook Form for form handling, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Custom authentication hooks with localStorage persistence

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM for PostgreSQL interactions
- **API Design**: RESTful endpoints with role-based routing for students and restaurants
- **Authentication**: Session-based authentication with role verification
- **Data Storage**: In-memory storage implementation with interface for easy database migration

### Database Design
- **Primary Database**: PostgreSQL with Neon Database serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**: Users (with role-based access), Restaurants, Menu Items, and Orders
- **Data Validation**: Zod schemas for runtime type checking and validation

### Project Structure
- **Client Directory**: Contains React frontend application with component-based architecture
- **Server Directory**: Houses Express backend with route handlers and business logic
- **Shared Directory**: Common TypeScript types and Zod schemas used by both frontend and backend
- **Component Organization**: UI components separated into layout, student-specific, and restaurant-specific modules

### Authentication & Authorization
- **Role-Based Access**: Separate signup/login flows for students and restaurants
- **Protected Routes**: Component-level route protection based on user roles
- **Session Management**: Persistent authentication state with automatic route redirection

### Development Tools
- **TypeScript**: Strict type checking across the entire codebase
- **ESBuild**: Fast bundling for production builds
- **Development Server**: Hot module replacement with Vite's development server
- **Code Organization**: Path aliases for clean imports and modular architecture

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon Database driver for PostgreSQL connections
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### UI & Styling
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with custom design system
- **class-variance-authority**: Dynamic class name generation for component variants
- **lucide-react**: Modern icon library with consistent design

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation resolvers for React Hook Form
- **wouter**: Minimalist routing library for React
- **date-fns**: Date manipulation and formatting utilities

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js development
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Database & Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **zod**: Runtime type validation and schema definition

The architecture is designed for easy deployment on Replit with automatic database provisioning and development tooling integration.