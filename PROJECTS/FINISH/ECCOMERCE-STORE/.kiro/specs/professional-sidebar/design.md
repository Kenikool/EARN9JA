# Professional Sidebar Design Document

## Overview

This design document outlines the implementation of a professional, reusable sidebar navigation component for the e-commerce application. The sidebar will provide enhanced navigation, user account management, and quick access to product categories with a modern, polished design that integrates seamlessly with the existing DaisyUI-based design system.

## Architecture

### Component Structure

```
Sidebar (Main Container)
├── SidebarHeader (User Section)
│   ├── UserAvatar
│   ├── UserInfo (Name, Email)
│   └── UserActions (Dropdown)
├── SidebarNav (Navigation Menu)
│   ├── NavItem (Home)
│   ├── NavItem (Shop)
│   ├── NavItem (Orders)
│   └── NavItem (Account)
├── SidebarCategories (Categories Section)
│   ├── CategoryList
│   └── CategoryItem[]
└── SidebarFooter (Optional)
```

### State Management

The sidebar will use a combination of:
- **Local State**: For UI interactions (collapsed/expanded, mobile drawer open/closed)
- **Local Storage**: For persisting user preferences (sidebar state)
- **Context/Hooks**: For accessing user authentication state and cart data
- **Zustand Store**: For managing sidebar state globally across the application

### Responsive Behavior

- **Desktop (≥1024px)**: Fixed sidebar, always visible, collapsible
- **Tablet (768px-1023px)**: Drawer overlay, toggled via hamburger menu
- **Mobile (<768px)**: Full-screen drawer, toggled via hamburger menu

## Components and Interfaces

### 1. Sidebar Component

**File**: `client/src/components/Sidebar/Sidebar.tsx`

```typescript
interface SidebarProps {
  className?: string;
}

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}
```

**Responsibilities**:
- Render the main sidebar container
- Handle responsive behavior (drawer on mobile, fixed on desktop)
- Manage collapsed/expanded state
- Persist state to local storage
- Provide smooth transitions and animations

**Key Features**:
- Sticky positioning on desktop
- Smooth slide-in/out animations
- Overlay backdrop on mobile
- Keyboard accessibility (ESC to close)
- Click outside to close on mobile

### 2. SidebarHeader Component

**File**: `client/src/components/Sidebar/SidebarHeader.tsx`

```typescript
interface SidebarHeaderProps {
  isCollapsed: boolean;
}
```

**Responsibilities**:
- Display user avatar or initials
- Show user name and email (when expanded)
- Provide dropdown menu for quick actions
- Handle authenticated vs. unauthenticated states

**States**:
- **Authenticated**: Show user info with dropdown (Profile, Settings, Logout)
- **Unauthenticated**: Show Login/Register buttons

### 3. SidebarNav Component

**File**: `client/src/components/Sidebar/SidebarNav.tsx`

```typescript
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
  requiresAuth?: boolean;
}

interface SidebarNavProps {
  isCollapsed: boolean;
}
```

**Responsibilities**:
- Render navigation menu items
- Highlight active route
- Show badges (e.g., cart count, order count)
- Handle navigation clicks
- Provide hover effects and tooltips (when collapsed)

**Navigation Items**:
1. Home - House icon
2. Shop - Store icon
3. Categories - Grid icon
4. Orders - Package icon (requires auth)
5. Account - User icon (requires auth)
6. Wishlist - Heart icon (requires auth)

### 4. SidebarCategories Component

**File**: `client/src/components/Sidebar/SidebarCategories.tsx`

```typescript
interface SidebarCategoriesProps {
  isCollapsed: boolean;
}

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  productCount?: number;
}
```

**Responsibilities**:
- Fetch and display product categories
- Show product count per category
- Handle category selection
- Provide scrollable list for many categories
- Highlight selected category

**Features**:
- Collapsible section with header
- Maximum height with scroll
- Loading skeleton
- Empty state handling

### 5. SidebarStore (Zustand)

**File**: `client/src/stores/sidebarStore.ts`

```typescript
interface SidebarStore {
  isOpen: boolean;
  isCollapsed: boolean;
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
}
```

**Responsibilities**:
- Manage global sidebar state
- Persist state to local storage
- Provide actions for state updates

## Data Models

### Local Storage Schema

```typescript
interface SidebarPreferences {
  isCollapsed: boolean;
  version: string; // For future migrations
}

// Storage key: 'sidebar-preferences'
```

### Category Data

Categories will be fetched from the existing API endpoint:
- **Endpoint**: `GET /api/categories`
- **Response**: Array of Category objects (see types/index.ts)

## Styling and Design

### Design Tokens

Using DaisyUI theme variables:
- **Background**: `bg-base-200`
- **Text**: `text-base-content`
- **Border**: `border-base-300`
- **Active**: `bg-primary text-primary-content`
- **Hover**: `hover:bg-base-300`

### Dimensions

- **Desktop Width (Expanded)**: 280px
- **Desktop Width (Collapsed)**: 80px
- **Mobile Width**: 100% (full screen)
- **Transition Duration**: 250ms
- **Z-Index**: 40 (sidebar), 30 (overlay)

### Animations

```css
/* Slide in from left */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Fade in overlay */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Accessibility

- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Tab, Enter, Escape
- **Focus Indicators**: Visible focus rings
- **Screen Reader**: Proper semantic HTML and ARIA attributes
- **Color Contrast**: Minimum 4.5:1 ratio

## Integration Points

### 1. Layout Component

Update `client/src/components/Layout.tsx` to include the Sidebar:

```typescript
<div className="min-h-screen flex">
  <Sidebar />
  <div className="flex-1 flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
  <CartDrawer />
</div>
```

### 2. Navbar Component

Add hamburger menu button for mobile:

```typescript
<button 
  onClick={() => sidebarStore.toggleSidebar()}
  className="btn btn-ghost btn-circle lg:hidden"
>
  <Menu className="w-6 h-6" />
</button>
```

### 3. Shop Page

Remove the existing FiltersSidebar and use the new Sidebar component for navigation. Keep product filters as a separate component within the Shop page content area.

## Error Handling

### Category Loading Errors

- **Strategy**: Show error message with retry button
- **Fallback**: Display empty categories section
- **User Feedback**: Toast notification for errors

### Local Storage Errors

- **Strategy**: Graceful degradation, use default state
- **Logging**: Console warning for debugging
- **Recovery**: Clear corrupted data and reset to defaults

### Authentication Errors

- **Strategy**: Redirect to login page for protected actions
- **User Feedback**: Toast notification explaining the requirement
- **State**: Update UI to show unauthenticated state

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Categories fetched only when sidebar is opened
2. **Memoization**: Use React.memo for NavItem and CategoryItem components
3. **Debouncing**: Debounce resize events for responsive behavior
4. **Virtual Scrolling**: Consider for large category lists (>50 items)
5. **Code Splitting**: Lazy load sidebar on mobile devices

### Bundle Size

- **Estimated Size**: ~15KB (minified + gzipped)
- **Dependencies**: No additional dependencies required
- **Icons**: Use existing lucide-react icons

## Testing Strategy

### Unit Tests

- Sidebar state management (Zustand store)
- Local storage persistence
- Component rendering with different props
- User interaction handlers

### Integration Tests

- Navigation flow
- Authentication state changes
- Category selection and filtering
- Responsive behavior

### Accessibility Tests

- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA attributes

### Visual Regression Tests

- Desktop expanded state
- Desktop collapsed state
- Mobile drawer state
- Different theme modes

## Migration Plan

### Phase 1: Core Sidebar Structure
- Create Sidebar component with basic layout
- Implement responsive behavior
- Add state management with Zustand

### Phase 2: Navigation and User Section
- Implement SidebarHeader with user info
- Add SidebarNav with navigation items
- Integrate with existing auth system

### Phase 3: Categories Integration
- Implement SidebarCategories component
- Fetch and display categories
- Handle category selection

### Phase 4: Polish and Optimization
- Add animations and transitions
- Implement local storage persistence
- Optimize performance
- Add accessibility features

### Phase 5: Integration and Testing
- Update Layout component
- Update Navbar for mobile toggle
- Comprehensive testing
- Documentation

## Future Enhancements

1. **Search Integration**: Add search bar within sidebar
2. **Recent Items**: Show recently viewed products
3. **Notifications**: Display notification badges
4. **Customization**: Allow users to reorder navigation items
5. **Themes**: Support for custom color schemes
6. **Multi-level Categories**: Support nested category hierarchies
