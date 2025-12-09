# Real Estate Platform - Project Structure

```
real-estate-platform/
├── client/                          # Next.js 15 App
│   ├── public/                      # Static assets
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── ...
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── (auth)/             # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── properties/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── agent/
│   │   │   │       └── page.tsx
│   │   │   ├── map/                # Map search page
│   │   │   │   └── page.tsx
│   │   │   ├── agents/             # Agents directory
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── favorites/          # Saved properties
│   │   │   │   └── page.tsx
│   │   │   ├── compare/            # Property comparison
│   │   │   │   └── page.tsx
│   │   │   ├── profile/            # User profile
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Home page
│   │   ├── components/             # Reusable components
│   │   │   ├── ui/                 # Basic UI components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── header.tsx
│   │   │   │   ├── footer.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── navbar.tsx
│   │   │   ├── property/           # Property-related components
│   │   │   │   ├── property-card.tsx
│   │   │   │   ├── property-grid.tsx
│   │   │   │   ├── property-detail.tsx
│   │   │   │   ├── property-gallery.tsx
│   │   │   │   ├── property-features.tsx
│   │   │   │   ├── property-map.tsx
│   │   │   │   ├── similar-properties.tsx
│   │   │   │   └── property-form.tsx
│   │   │   ├── map/                # Map components
│   │   │   │   ├── map-view.tsx
│   │   │   │   ├── property-marker.tsx
│   │   │   │   ├── map-controls.tsx
│   │   │   │   └── cluster-marker.tsx
│   │   │   ├── agent/              # Agent components
│   │   │   │   ├── agent-card.tsx
│   │   │   │   ├── agent-profile.tsx
│   │   │   │   ├── agent-listings.tsx
│   │   │   │   └── contact-agent.tsx
│   │   │   ├── forms/              # Form components
│   │   │   │   ├── inquiry-form.tsx
│   │   │   │   ├── appointment-form.tsx
│   │   │   │   ├── mortgage-calculator.tsx
│   │   │   │   └── search-form.tsx
│   │   │   ├── dashboard/          # Dashboard components
│   │   │   │   ├── dashboard-stats.tsx
│   │   │   │   ├── inquiry-manager.tsx
│   │   │   │   ├── appointment-manager.tsx
│   │   │   │   └── lead-tracker.tsx
│   │   │   └── common/             # Shared components
│   │   │       ├── search-bar.tsx
│   │   │       ├── filter-panel.tsx
│   │   │       ├── pagination.tsx
│   │   │       └── toast.tsx
│   │   ├── lib/                    # Utilities and configurations
│   │   │   ├── db.ts               # Database connection
│   │   │   ├── auth.ts             # Auth utilities
│   │   │   ├── utils.ts            # General utilities
│   │   │   ├── validators.ts       # Form validation schemas
│   │   │   ├── formatters.ts       # Data formatting
│   │   │   ├── constants.ts        # App constants
│   │   │   └── config.ts           # App configuration
│   │   ├── store/                  # Zustand stores
│   │   │   ├── auth-store.ts       # Authentication state
│   │   │   ├── property-store.ts   # Property filters/search
│   │   │   ├── map-store.ts        # Map view state
│   │   │   ├── favorites-store.ts  # Favorites state
│   │   │   └── ui-store.ts         # UI state (modals, etc.)
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── use-properties.ts   # Property data fetching
│   │   │   ├── use-map.ts          # Map functionality
│   │   │   ├── use-geolocation.ts  # Location services
│   │   │   ├── use-favorites.ts    # Favorites management
│   │   │   ├── use-auth.ts         # Authentication hook
│   │   │   └── use-query.ts        # Query optimization
│   │   ├── types/                  # TypeScript type definitions
│   │   │   ├── property.ts
│   │   │   ├── user.ts
│   │   │   ├── inquiry.ts
│   │   │   ├── appointment.ts
│   │   │   └── common.ts
│   │   └── api/                    # API endpoints (Next.js API routes)
│   │       ├── auth/               # Authentication endpoints
│   │       │   ├── register/
│   │       │   │   └── route.ts
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── me/
│   │       │   │   └── route.ts
│   │       │   └── logout/
│   │       │       └── route.ts
│   │       ├── properties/         # Property endpoints
│   │       │   ├── route.ts        # GET, POST
│   │       │   ├── [id]/
│   │       │   │   └── route.ts    # GET, PUT, DELETE
│   │       │   ├── search/
│   │       │   │   └── route.ts    # GET with filters
│   │       │   ├── featured/
│   │       │   │   └── route.ts    # GET
│   │       │   └── nearby/
│   │       │       └── route.ts    # GET by location
│   │       ├── agents/             # Agent endpoints
│   │       │   ├── route.ts
│   │       │   ├── [id]/
│   │       │   │   └── route.ts
│   │       │   └── [id]/
│   │       │       └── properties/
│   │       │           └── route.ts
│   │       ├── inquiries/          # Inquiry endpoints
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── appointments/       # Appointment endpoints
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── reviews/            # Review endpoints
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── favorites/          # Favorites endpoints
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── upload/             # File upload
│   │       │   └── route.ts
│   │       └── geocoding/          # Geocoding service
│   │           └── route.ts
│   ├── .env.local                  # Environment variables
│   ├── .gitignore
│   ├── next.config.ts
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── README.md
├── .qodo/                          # VS Code workspace
└── README.md                       # Main project README
```

## Key Directories Explained

### Next.js App Router Structure

- **app/**: Uses Next.js 13+ App Router for file-based routing
- **Route Groups**: `(auth)` and `(dashboard)` for organizing routes without affecting URL paths
- **Dynamic Routes**: `[id]` for dynamic property and agent pages
- **Layouts**: Shared layouts for different route groups

### Component Organization

- **components/ui/**: Basic UI components (buttons, inputs, etc.)
- **components/layout/**: Layout-related components (header, footer, etc.)
- **components/property/**: Property-specific components
- **components/map/**: Map-related components
- **components/agent/**: Agent-specific components
- **components/forms/**: Form components for user interactions
- **components/dashboard/**: Dashboard-specific components

### State Management with Zustand

- **auth-store.ts**: User authentication state (logged in user, tokens, etc.)
- **property-store.ts**: Property search and filter state
- **map-store.ts**: Map view state (center, zoom, bounds, etc.)
- **favorites-store.ts**: Saved properties state
- **ui-store.ts**: UI state (loading states, modals, notifications)

### Custom Hooks

- **use-properties.ts**: React Query hook for property data fetching
- **use-map.ts**: Map-related hooks
- **use-geolocation.ts**: Location services
- **use-favorites.ts**: Favorites management
- **use-auth.ts**: Authentication logic
- **use-query.ts**: Query optimization and caching

### Next.js API Routes

- **api/auth/**: Authentication endpoints (register, login, me, logout)
- **api/properties/**: Property CRUD operations with search and filters
- **api/agents/**: Agent management endpoints
- **api/inquiries/**: Inquiry submission and management
- **api/appointments/**: Appointment scheduling
- **api/reviews/**: Property reviews
- **api/favorites/**: Favorites management
- **api/upload/**: File upload handling with Cloudinary
- **api/geocoding/**: Address geocoding services

### Type Safety

- **types/**: Centralized TypeScript definitions for all entities
- **lib/validators.ts**: Yup validation schemas for forms
- **lib/utils.ts**: Utility functions and helpers

### Database (MongoDB Atlas)

- **lib/db.ts**: Mongoose connection and configuration
- **Models**: User, Property, Inquiry, Appointment, Review, Favorite
- **Indexes**: Geospatial index on Property.location for location-based queries

### Styling Architecture

- **globals.css**: Global styles and Tailwind imports
- **tailwind.config.ts**: Tailwind configuration with DaisyUI
- **Component Styling**: Tailwind CSS classes with DaisyUI components
- **Responsive Design**: Mobile-first approach with responsive utilities

### Key Features Enabled by This Structure

- **SEO Optimization**: Next.js App Router provides automatic SEO benefits
- **Server-Side Rendering**: SSR and SSG capabilities for performance
- **API Integration**: Seamless API routes for backend functionality
- **Type Safety**: Full TypeScript coverage
- **Modern State Management**: Zustand for client state, React Query for server state
- **Component Reusability**: Well-organized component library
- **Developer Experience**: Hot reloading, TypeScript support, linting
