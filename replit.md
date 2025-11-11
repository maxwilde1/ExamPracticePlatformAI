# GCSE & A-Level Exam Practice Platform

## Overview

This is a modern web application that allows students to practice GCSE and A-Level exam papers with AI-powered automated marking and feedback. The platform serves as a comprehensive exam preparation tool where students can browse past papers by exam board, subject, and year, complete them page-by-page, and receive instant feedback powered by OpenAI's API.

The system supports multiple exam boards (AQA, Edexcel, OCR, WJEC, CCEA) across two educational levels (GCSE and A-Level) with a focus on core subjects like Mathematics, Sciences, and English. The application provides both student-facing features for practicing exams and admin features for managing the paper database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with a custom design system

**Design System:**
- Material Design principles combined with educational platform aesthetics
- Custom Tailwind configuration with extended color palette for light/dark themes
- Typography: Inter/IBM Plex Sans for body text, JetBrains Mono for monospace
- Consistent spacing units (2, 4, 6, 8, 12, 16) and border radius values
- Hover and active elevation effects for interactive elements

**Key Pages:**
- HomePage: Paper discovery with search/filter functionality and grid display
- ExamPage: Split-view exam interface with PDF viewer and answer input
- ResultsPage: Page-by-page results with AI feedback and improvement tips
- AdminDashboard: Paper management and moderation queue for low-confidence markings

**State Management:**
- Server state handled via TanStack Query with caching and refetching strategies
- Local state managed with React hooks (useState, useEffect)
- Session persistence using localStorage for anonymous user sessions and attempt tracking

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js for the REST API server
- TypeScript throughout for type consistency with frontend
- Drizzle ORM for database interactions with type-safe queries
- Neon (PostgreSQL) as the database provider via serverless connection pooling

**API Design:**
- RESTful endpoints following resource-based patterns
- JSON request/response format with proper error handling
- Session-based tracking for anonymous users (no authentication required for students)
- File upload handling via Multer middleware for PDF uploads

**Data Model:**
The database schema follows a hierarchical structure:
- **Boards, Levels, Subjects**: Taxonomy tables for organizing papers
- **Papers**: Core entity storing metadata (board, subject, year, series, tier) and file paths
- **PaperPages**: Individual page records with image paths and OCR text
- **Questions**: Question metadata linked to papers (though page-based answering is primary flow)
- **Attempts**: User practice sessions with start/completion timestamps
- **Responses**: Individual page answers with student input, AI scores, and feedback
- **AdminUsers**: Admin authentication (basic, can be enhanced)

**Key Services:**
- **PDF Processing**: Converts uploaded PDFs to per-page PNG images using pdftoppm for web display
- **OpenAI Integration**: Sends student answers with marking context to GPT models for automated grading
- **Storage Service**: Abstraction layer over database operations for cleaner separation of concerns

### External Dependencies

**Database:**
- Neon PostgreSQL (serverless) accessed via `@neondatabase/serverless`
- Connection pooling with WebSocket support for serverless environments
- Drizzle ORM provides type-safe query building and migrations

**Third-Party APIs:**
- **OpenAI API**: Used for automated answer marking and feedback generation
  - Requires `OPENAI_API_KEY` environment variable
  - Implements structured prompting for consistent grading with confidence levels
  - Returns awarded marks, feedback, improvement tips, and confidence assessment

**File Processing:**
- **pdftoppm**: System-level utility for converting PDF pages to images
  - Required for the PDF processing pipeline
  - Generates web-optimized PNG images at 150 DPI
- **pdf-lib**: JavaScript library for PDF manipulation and page counting

**UI Component Libraries:**
- **Radix UI**: Headless accessible component primitives (@radix-ui/*)
- **Shadcn/ui**: Pre-built component implementations on top of Radix
- **Lucide React**: Icon library for consistent iconography

**Development Tools:**
- **Replit-specific plugins**: Runtime error overlay, cartographer, dev banner
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundler for production builds

**Storage:**
- Local filesystem storage for uploaded PDFs and generated page images
- Files stored in `uploads/` directory with subdirectories for papers and page images
- Frontend serves static files via Express middleware

**Session Management:**
- Anonymous session IDs generated client-side using timestamp + random string
- Stored in localStorage for persistence across page reloads
- No traditional authentication system for student users (admin has basic login UI)