# Admin Panel Implementation Plan

- [x] 1. Project Setup and Core Infrastructure

  - Initialize project with Vite, React 19, and TypeScript
  - Install and configure TailwindCSS v4 and DaisyUI v5
  - Set up project directory structure
  - Configure environment variables
  - Install core dependencies (React Router, React Query, Zustand, Axios)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Initialize Vite project with React and TypeScript

  - Run `npm create vite@latest admin -- --template react-ts`
  - Configure `tsconfig.json` with strict mode and path aliases
  - Update `vite.config.ts` with build optimizations
  - _Requirements: 1.1_

- [ ] 1.2 Install and configure styling dependencies

  - Install TailwindCSS v4 and DaisyUI v5

  - Set up `index.css` with Tailwind directives
  - Configure custom color palette and design tokens
  - _Requirements: 1.2_

- [ ] 1.3 Set up routing and state management

  - Install React Router v6, React Query, and Zustand
  - Create router configuration in `App.tsx`
  - Set up React Query client with default options
  - Create initial store structure
  - _Requirements: 1.3_

- [ ] 1.4 Configure API client and interceptors

  - Create `src/services/api.ts` with Axios instance
  - Implement request interceptor for auth tokens
  - Implement response interceptor for error handling
  - Add retry logic for failed requests
  - _Requirements: 1.4_

- [ ] 1.5 Create TypeScript type definitions

  - Create `src/types/user.types.ts` with User interface
  - Create `src/types/task.types.ts` with Task interface
  - Create `src/types/withdrawal.types.ts` with Withdrawal interface
  - Create `src/types/dispute.types.ts` with Dispute interface
  - Create `src/types/api.types.ts` with API response types
  - _Requirements: 1.5_

- [x] 2. Authentication System

  - Create auth store with Zustand
  - Implement login page with form validation
  - Implement register page with OTP verification
  - Create protected route wrapper
  - Implement token refresh logic
  - Add logout functionality
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2.1 Create authentication store

  - Create `src/store/authStore.ts` with Zustand
  - Implement login, logout, and token refresh actions
  - Add token persistence to localStorage
  - Implement auto-logout on token expiration
  - _Requirements: 1.1, 1.4_

- [x] 2.2 Build login page

  - Create `src/pages/auth/LoginPage.tsx`
  - Implement login form with email and password fields
  - Add form validation with Zod
  - Integrate with auth store login action
  - Display error messages for failed login attempts
  - Add "Remember me" checkbox
  - _Requirements: 1.1, 1.2_

- [x] 2.3 Build register page

  - Create `src/pages/auth/RegisterPage.tsx`
  - Implement registration form with all required fields
  - Add OTP verification step
  - Integrate with backend registration endpoints
  - Display success message and redirect to login
  - _Requirements: 1.1, 1.2_
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

- [x] 2.4 Implement route protection

  - Create `ProtectedRoute` component
  - Check authentication status before rendering
  - Verify admin role from user object
  - Redirect to login if not authenticated
  - Redirect to unauthorized page if not admin
  - _Requirements: 1.4_

- [ ] 3. Core Layout Components

  - Create dashboard layout with sidebar and header
  - Implement responsive navigation menu
  - Create breadcrumb navigation
  - Add notification dropdown
  - Implement user profile dropdown
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ] 3.1 Build DashboardLayout component

  - Create `src/layouts/DashboardLayout.tsx`
  - Implement sidebar with navigation links
  - Create collapsible sidebar for mobile
  - Add header with logo and user actions
  - Integrate with UI store for sidebar state
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Create Sidebar component

  - Create `src/components/layout/Sidebar.tsx`
  - Add navigation links for all pages
  - Implement active link highlighting
  - Add icons for each menu item
  - Make sidebar collapsible on mobile
  - _Requirements: 2.3_

- [ ] 3.3 Create Header component

  - Create `src/components/layout/Header.tsx`
  - Add logo and app name
  - Implement search bar (placeholder for future)
  - Add notification bell with badge
  - Add user profile dropdown with logout
  - _Requirements: 2.4, 2.5_

- [ ] 3.4 Create Breadcrumb component

  - Create `src/components/layout/Breadcrumb.tsx`
  - Generate breadcrumbs from current route
  - Make breadcrumb items clickable
  - Style with TailwindCSS
  - _Requirements: 2.6_

- [ ] 4. Reusable UI Components

  - Create DataTable component with sorting and pagination
  - Create FilterBar component for search and filters
  - Create Modal component for dialogs
  - Create ConfirmDialog for confirmations
  - Create StatCard for dashboard metrics
  - Create LoadingSpinner component
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ] 4.1 Build DataTable component

  - Create `src/components/common/DataTable.tsx`
  - Implement column configuration with render functions
  - Add sorting functionality for sortable columns
  - Implement pagination controls
  - Add row selection with checkboxes
  - Add loading state with skeleton
  - Add empty state message
  - _Requirements: 3.1, 4.1, 5.1, 6.1_

- [ ] 4.2 Build FilterBar component

  - Create `src/components/common/FilterBar.tsx`
  - Implement search input with debounce
  - Add filter dropdowns (select, date, dateRange)
  - Add clear filters button
  - Emit filter changes to parent component
  - _Requirements: 3.2, 3.3, 3.4, 4.2, 4.3, 5.2, 5.3, 6.2, 6.3_

- [ ] 4.3 Build Modal component

  - Create `src/components/common/Modal.tsx`
  - Implement backdrop with click-to-close
  - Add close button in header
  - Support different sizes (sm, md, lg, xl)
  - Add footer slot for action buttons
  - Implement focus trap for accessibility
  - _Requirements: 3.6, 4.5, 5.5, 6.5, 7.4_

- [ ] 4.4 Build ConfirmDialog component

  - Create `src/components/common/ConfirmDialog.tsx`
  - Add title and message props
  - Implement confirm and cancel buttons
  - Support different variants (warning, error, info)
  - Add loading state during confirmation
  - _Requirements: 3.7, 3.8, 4.6, 4.7, 5.6, 5.7, 6.6, 6.7_

- [ ] 4.5 Build StatCard component

  - Create `src/components/common/StatCard.tsx`
  - Display title, value, and icon
  - Add optional trend indicator
  - Support different color themes
  - Add description text
  - Implement hover effects
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 4.6 Build LoadingSpinner component

  - Create `src/components/common/LoadingSpinner.tsx`
  - Implement spinner animation
  - Support different sizes
  - Add optional loading text
  - _Requirements: 15.9_

- [ ] 5. Dashboard Page

  - Create dashboard page with statistics overview
  - Implement platform stats cards
  - Add quick action buttons
  - Create recent activity feed
  - Add charts for key metrics
  - Implement auto-refresh functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ] 5.1 Create Dashboard page structure

  - Create `src/pages/Dashboard.tsx`
  - Set up page layout with grid
  - Add page title and description
  - Implement refresh button
  - _Requirements: 2.1, 2.9_

- [ ] 5.2 Fetch and display platform statistics

  - Create `useP latformStats` hook
  - Fetch data from `/api/v1/admin/stats`
  - Display user statistics (total, active)
  - Display task statistics (total, active, completed)
  - Display financial statistics (revenue, payouts, pending withdrawals)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 5.3 Create StatCard instances for each metric

  - Create StatCard for total users
  - Create StatCard for active tasks
  - Create StatCard for pending withdrawals
  - Create StatCard for platform revenue
  - Add appropriate icons and colors
  - Add trend indicators
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.10_

- [ ] 5.4 Implement quick actions section

  - Create QuickActions component
  - Add buttons for common actions (View Users, Pending Tasks, Withdrawals, Analytics)
  - Link buttons to respective pages
  - Style with DaisyUI button classes
  - _Requirements: 2.9_

- [ ] 5.5 Add platform health indicators

  - Create health status cards
  - Display active users count
  - Display active tasks count
  - Display pending withdrawals count
  - Display revenue metrics
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 6. User Management Page

  - Create users page with list view
  - Implement user filtering and search
  - Create user detail modal
  - Implement suspend user action
  - Implement ban user action
  - Implement reactivate user action
  - Add bulk actions support
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13_

- [ ] 6.1 Create Users page structure

  - Create `src/pages/Users.tsx`
  - Set up page layout with filters and table
  - Add page title and export button
  - _Requirements: 3.1_

- [ ] 6.2 Implement user data fetching

  - Create `useUsers` hook with React Query
  - Fetch data from `/api/v1/admin/users`
  - Support pagination parameters
  - Support filter parameters (status, role, KYC)
  - Support search parameter
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6.3 Build user list table

  - Use DataTable component
  - Define columns (user, contact, role, status, KYC, wallet, joined, actions)
  - Implement row rendering with user data
  - Add action dropdown for each user
  - _Requirements: 3.1, 3.6, 3.10, 3.11, 3.12, 3.13_

- [ ] 6.4 Implement user filtering

  - Use FilterBar component
  - Add status filter dropdown
  - Add role filter dropdown
  - Add KYC verification filter
  - Add search input for name/email/phone
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 6.5 Create user detail modal

  - Create UserDetailModal component
  - Fetch user details from `/api/v1/admin/users/:userId`
  - Display complete user profile
  - Display wallet information
  - Display reputation and statistics
  - Display activity history
  - _Requirements: 3.6, 3.10, 3.11, 3.12, 3.13_

- [ ] 6.6 Implement suspend user action

  - Create `useSuspendUser` mutation hook
  - Add suspend button in user actions
  - Show confirmation dialog with reason input
  - Call `/api/v1/admin/users/:userId/suspend`
  - Invalidate users query on success
  - Show success/error toast
  - _Requirements: 3.7_

- [ ] 6.7 Implement ban user action

  - Create `useBanUser` mutation hook
  - Add ban button in user actions
  - Show confirmation dialog with reason input
  - Call `/api/v1/admin/users/:userId/ban`
  - Invalidate users query on success
  - Show success/error toast
  - _Requirements: 3.8_

- [ ] 6.8 Implement reactivate user action

  - Create `useReactivateUser` mutation hook
  - Add reactivate button for suspended/banned users
  - Show confirmation dialog
  - Call `/api/v1/admin/users/:userId/reactivate`
  - Invalidate users query on success
  - Show success/error toast
  - _Requirements: 3.9_

- [ ] 6.9 Implement bulk user actions

  - Add checkbox selection to DataTable
  - Create BulkActionBar component
  - Add bulk suspend action
  - Add bulk ban action
  - Show confirmation for bulk actions
  - Display progress and results
  - _Requirements: 12.1, 12.2, 12.4, 12.7, 12.8, 12.9, 12.10_

- [ ] 7. Task Management Page

  - Create tasks page with list view
  - Implement task filtering and search
  - Create task detail modal
  - Implement approve task action
  - Implement reject task action
  - Add bulk task actions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 7.1 Create Tasks page structure

  - Create `src/pages/Tasks.tsx`
  - Set up page layout with filters and list
  - Add page title and export button
  - _Requirements: 4.1_

- [ ] 7.2 Implement task data fetching

  - Create `useTasks` hook with React Query
  - Fetch data from `/api/v1/admin/tasks/pending`
  - Support pagination parameters
  - Support filter parameters (status, category)
  - Support search parameter
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7.3 Build task list cards

  - Create TaskCard component
  - Display task title, description, and metadata
  - Show task status badge
  - Display reward and slots information
  - Show progress bar for slot completion
  - Add action buttons (approve, reject, view details)
  - _Requirements: 4.1, 4.5, 4.8, 4.9, 4.10_

- [ ] 7.4 Implement task filtering

  - Use FilterBar component
  - Add status filter dropdown
  - Add category filter dropdown
  - Add search input for title/description
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 7.5 Create task detail modal

  - Create TaskDetailModal component
  - Display complete task information
  - Show task requirements and proof requirements
  - Display task images
  - Show sponsor information
  - Display creation and expiration dates
  - _Requirements: 4.5, 4.8, 4.9, 4.10_

- [ ] 7.6 Implement approve task action

  - Create `useApproveTask` mutation hook
  - Add approve button in task actions
  - Show confirmation dialog
  - Call `/api/v1/admin/tasks/:taskId/approve`
  - Invalidate tasks query on success
  - Show success/error toast
  - _Requirements: 4.6_

- [ ] 7.7 Implement reject task action

  - Create `useRejectTask` mutation hook
  - Add reject button in task actions
  - Show confirmation dialog with reason input
  - Call `/api/v1/admin/tasks/:taskId/reject`
  - Invalidate tasks query on success
  - Show success/error toast
  - _Requirements: 4.7_

- [ ] 7.8 Implement bulk task actions

  - Add selection to task cards
  - Create BulkActionBar component
  - Add bulk approve action
  - Add bulk reject action
  - Show confirmation for bulk actions
  - Display progress and results
  - _Requirements: 12.2, 12.3, 12.5, 12.7, 12.8, 12.9, 12.10_

- [ ] 8. Withdrawal Management Page

  - Create withdrawals page with list view
  - Implement withdrawal filtering and search
  - Create withdrawal detail modal
  - Implement approve withdrawal action
  - Implement reject withdrawal action
  - Add bulk withdrawal actions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

- [ ] 8.1 Create Withdrawals page structure

  - Create `src/pages/Withdrawals.tsx`
  - Set up page layout with filters and list
  - Add page title and export button
  - _Requirements: 5.1_

- [ ] 8.2 Implement withdrawal data fetching

  - Create `useWithdrawals` hook with React Query
  - Fetch data from `/api/v1/admin/withdrawals/pending`
  - Support pagination parameters
  - Support filter parameters (status, method)
  - Support search parameter
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8.3 Build withdrawal list cards

  - Create WithdrawalCard component
  - Display amount, user, and method
  - Show status badge
  - Display account details
  - Show transaction details (fee, net amount)
  - Add action buttons (approve, reject, view details)
  - _Requirements: 5.1, 5.5, 5.8, 5.9, 5.10, 5.11_

- [ ] 8.4 Implement withdrawal filtering

  - Use FilterBar component
  - Add status filter dropdown
  - Add method filter dropdown
  - Add search input for user/reference
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 8.5 Create withdrawal detail modal

  - Create WithdrawalDetailModal component
  - Display complete withdrawal information
  - Show user details
  - Display account details (bank or mobile money)
  - Show transaction breakdown
  - Display request and processing dates
  - _Requirements: 5.5, 5.8, 5.9, 5.10, 5.11_

- [ ] 8.6 Implement approve withdrawal action

  - Create `useApproveWithdrawal` mutation hook
  - Add approve button in withdrawal actions
  - Show confirmation dialog
  - Call `/api/v1/admin/withdrawals/:withdrawalId/approve`
  - Invalidate withdrawals query on success
  - Show success/error toast
  - _Requirements: 5.6_

- [ ] 8.7 Implement reject withdrawal action

  - Create `useRejectWithdrawal` mutation hook
  - Add reject button in withdrawal actions
  - Show confirmation dialog with reason input
  - Call `/api/v1/admin/withdrawals/:withdrawalId/reject`
  - Invalidate withdrawals query on success
  - Show success/error toast
  - _Requirements: 5.7_

- [ ] 8.8 Implement bulk withdrawal actions

  - Add selection to withdrawal cards
  - Create BulkActionBar component
  - Add bulk approve action
  - Add bulk reject action
  - Show confirmation for bulk actions
  - Display progress and results
  - _Requirements: 12.3, 12.6, 12.7, 12.8, 12.9, 12.10_

- [ ] 9. Dispute Resolution Page

  - Create disputes page with list view
  - Implement dispute filtering
  - Create dispute detail view
  - Implement resolve dispute action
  - Implement update dispute status
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_

- [ ] 9.1 Create Disputes page structure

  - Create `src/pages/Disputes.tsx`
  - Set up page layout with filters and list
  - Add page title
  - _Requirements: 6.1_

- [ ] 9.2 Implement dispute data fetching

  - Create `useDisputes` hook with React Query
  - Fetch data from `/api/v1/admin/disputes/pending`
  - Support pagination parameters
  - Support filter parameters (status, type)
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9.3 Build dispute list cards

  - Create DisputeCard component
  - Display dispute type and status
  - Show reporter and reported user
  - Display task information
  - Add view details button
  - _Requirements: 6.1, 6.4, 6.11_

- [ ] 9.4 Implement dispute filtering

  - Use FilterBar component
  - Add status filter dropdown
  - Add type filter dropdown
  - _Requirements: 6.2, 6.3_

- [ ] 9.5 Create dispute detail view

  - Create DisputeDetailView component
  - Display complete dispute information
  - Show task and submission details
  - Display reporter and reported user information
  - Show evidence (images, videos, links, text)
  - Display dispute description
  - Add resolution form
  - _Requirements: 6.4, 6.11_

- [ ] 9.6 Implement resolve dispute action

  - Create `useResolveDispute` mutation hook
  - Create ResolutionForm component
  - Add decision input field
  - Add action selector (refund_worker, refund_sponsor, no_action, ban_user)
  - Add notes textarea
  - Call `/api/v1/admin/disputes/:disputeId/resolve`
  - Invalidate disputes query on success
  - Show success/error toast
  - _Requirements: 6.5, 6.6, 6.7, 6.8, 6.9, 6.10_

- [ ] 9.7 Implement update dispute status

  - Create `useUpdateDisputeStatus` mutation hook
  - Add status update buttons
  - Call `/api/v1/admin/disputes/:disputeId/status`
  - Invalidate disputes query on success
  - Show success/error toast
  - _Requirements: 6.12_

- [ ] 10. Analytics and Reporting Page

  - Create analytics page with charts
  - Implement date range selector
  - Display user growth metrics
  - Display task completion metrics
  - Display revenue metrics
  - Display AdMob analytics
  - Implement data export functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

- [ ] 10.1 Create Analytics page structure

  - Create `src/pages/Analytics.tsx`
  - Set up page layout with date range selector
  - Add page title and export button
  - Install Recharts library
  - _Requirements: 7.1, 7.5_

- [ ] 10.2 Implement date range selector

  - Create DateRangePicker component
  - Add preset options (Last 7 days, Last 30 days, Last 90 days, Custom)
  - Emit date range changes to parent
  - _Requirements: 7.5_

- [ ] 10.3 Fetch and display user growth metrics

  - Create `useUserGrowth` hook
  - Fetch data from `/api/v1/admin/stats`
  - Create LineChart for user growth over time
  - Display total users and active users
  - _Requirements: 7.1_

- [ ] 10.4 Fetch and display task completion metrics

  - Create `useTaskMetrics` hook
  - Fetch data from `/api/v1/admin/stats`
  - Create BarChart for task completions
  - Display total tasks, active tasks, and completed tasks
  - _Requirements: 7.2_

- [ ] 10.5 Fetch and display revenue metrics

  - Create `useRevenueReport` hook
  - Fetch data from `/api/v1/admin/revenue-report`
  - Create LineChart for revenue over time
  - Display total revenue and total payouts
  - Calculate and display net revenue
  - _Requirements: 7.3_

- [ ] 10.6 Fetch and display withdrawal metrics

  - Create `useWithdrawalMetrics` hook
  - Fetch data from `/api/v1/admin/stats`
  - Create chart for withdrawal trends
  - Display pending withdrawals count
  - _Requirements: 7.4_

- [ ] 10.7 Fetch and display AdMob analytics

  - Create `useAdMobAnalytics` hook
  - Fetch data from `/api/v1/admin-analytics/admob`
  - Display total ads watched
  - Display unique users
  - Display total revenue
  - Create PieChart for platform breakdown (iOS vs Android)
  - Display top earning users
  - Display average ads per user
  - Display average revenue per user
  - _Requirements: 7.6, 7.7, 7.8, 7.9, 7.12_

- [ ] 10.8 Implement daily/weekly/monthly aggregation

  - Add groupBy selector (day, week, month)
  - Update charts based on selected aggregation
  - _Requirements: 7.11_

- [ ] 10.9 Implement data export functionality

  - Create `exportAnalytics` function
  - Generate CSV from analytics data
  - Add export button for each chart
  - Trigger download of CSV file
  - _Requirements: 7.10, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10_

- [ ] 11. KYC Verification Page

  - Create KYC page with submissions list
  - Implement KYC filtering
  - Create KYC detail modal with document viewer
  - Implement approve KYC action
  - Implement reject KYC action
  - Implement request resubmission action
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

- [ ] 11.1 Create KYC page structure

  - Create `src/pages/KYC.tsx`
  - Set up page layout with filters and list
  - Add page title
  - _Requirements: 8.1_

- [ ] 11.2 Implement KYC data fetching

  - Create `useKYCSubmissions` hook
  - Fetch data from `/api/v1/admin/kyc/pending`
  - Support pagination parameters
  - Support filter parameters (status, type)
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11.3 Build KYC submissions list

  - Use DataTable component
  - Define columns (user, type, status, submitted date, actions)
  - Add action buttons for each submission
  - _Requirements: 8.1, 8.4_

- [ ] 11.4 Implement KYC filtering

  - Use FilterBar component
  - Add status filter dropdown
  - Add verification type filter dropdown
  - _Requirements: 8.2, 8.3_

- [ ] 11.5 Create KYC detail modal

  - Create KYCDetailModal component
  - Display user information
  - Display identity number and verification type
  - Create DocumentViewer component for images
  - Display verification data
  - Show submission and verification dates
  - Add action buttons (approve, reject, resubmit)
  - _Requirements: 8.4, 8.8, 8.9, 8.10_

- [ ] 11.6 Implement approve KYC action

  - Create `useApproveKYC` mutation hook
  - Add approve button in KYC actions
  - Show confirmation dialog
  - Call `/api/v1/admin/kyc/:kycId/approve`
  - Invalidate KYC query on success
  - Show success/error toast
  - _Requirements: 8.5_

- [ ] 11.7 Implement reject KYC action

  - Create `useRejectKYC` mutation hook
  - Add reject button in KYC actions
  - Show confirmation dialog with reason input
  - Call `/api/v1/admin/kyc/:kycId/reject`
  - Invalidate KYC query on success
  - Show success/error toast
  - _Requirements: 8.6_

- [ ] 11.8 Implement request resubmission action

  - Create `useRequestKYCResubmission` mutation hook
  - Add resubmit button in KYC actions
  - Show dialog with reason input
  - Call `/api/v1/admin/kyc/:kycId/resubmit`
  - Invalidate KYC query on success
  - Show success/error toast
  - _Requirements: 8.7_

- [ ] 12. Support Ticket Management Page

  - Create support page with tickets list
  - Implement ticket filtering
  - Create ticket detail view
  - Implement ticket response functionality
  - Implement ticket status updates
  - Implement ticket assignment
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_

- [ ] 12.1 Create Support page structure

  - Create `src/pages/Support.tsx`
  - Set up page layout with filters and list
  - Add page title
  - _Requirements: 9.1_

- [ ] 12.2 Implement support ticket data fetching

  - Create `useSupportTickets` hook
  - Fetch data from `/api/v1/admin/support/tickets`
  - Support pagination parameters
  - Support filter parameters (status, category, priority)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12.3 Build support tickets list

  - Use DataTable component
  - Define columns (subject, user, category, priority, status, created, actions)
  - Add action buttons for each ticket
  - _Requirements: 9.1, 9.5_

- [ ] 12.4 Implement ticket filtering

  - Use FilterBar component
  - Add status filter dropdown
  - Add category filter dropdown
  - Add priority filter dropdown
  - _Requirements: 9.2, 9.3, 9.4_

- [ ] 12.5 Create ticket detail view

  - Create TicketDetailView component
  - Display ticket subject and description
  - Show user information
  - Display conversation history
  - Show attachments if available
  - Add response form
  - Add status update buttons
  - Add assign to me button
  - _Requirements: 9.5, 9.9, 9.10_

- [ ] 12.6 Implement ticket response functionality

  - Create ResponseForm component
  - Add message textarea
  - Call `/api/v1/admin/support/tickets/:ticketId/respond`
  - Invalidate ticket query on success
  - Show success/error toast
  - _Requirements: 9.6_

- [ ] 12.7 Implement ticket status updates

  - Create `useUpdateTicketStatus` mutation hook
  - Add status buttons (in_progress, resolved, closed)
  - Call `/api/v1/admin/support/tickets/:ticketId/status`
  - Invalidate tickets query on success
  - Show success/error toast
  - _Requirements: 9.7, 9.11_

- [ ] 12.8 Implement ticket assignment

  - Create `useAssignTicket` mutation hook
  - Add assign to me button
  - Call `/api/v1/admin/support/tickets/:ticketId/assign`
  - Invalidate tickets query on success
  - Show success/error toast
  - _Requirements: 9.8_

- [ ] 13. Activity Log Page

  - Create activity log page with audit trail
  - Implement activity log filtering
  - Display detailed action information
  - Implement log export functionality
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_

- [ ] 13.1 Create Activity Log page structure

  - Create `src/pages/ActivityLog.tsx`
  - Set up page layout with filters and table
  - Add page title and export button
  - _Requirements: 13.2_

- [ ] 13.2 Implement activity log data fetching

  - Create `useActivityLogs` hook
  - Fetch data from `/api/v1/admin/activity-logs`
  - Support pagination parameters
  - Support filter parameters (admin, action type, date range)
  - _Requirements: 13.2, 13.3, 13.4, 13.5_

- [ ] 13.3 Build activity log table

  - Use DataTable component
  - Define columns (timestamp, admin, action, entity, details)
  - Display action type with badge
  - Show affected entity information
  - _Requirements: 13.2, 13.6, 13.9, 13.10_

- [ ] 13.4 Implement activity log filtering

  - Use FilterBar component
  - Add admin user filter dropdown
  - Add action type filter dropdown
  - Add date range picker
  - _Requirements: 13.3, 13.4, 13.5_

- [ ] 13.5 Implement log export functionality

  - Create export function for activity logs
  - Generate CSV with all log details
  - Add export button
  - Trigger download of CSV file
  - _Requirements: 13.7, 14.10_

- [ ] 14. Settings Page

  - Create settings page with configuration options
  - Implement platform configuration form
  - Add save settings functionality
  - Display current configuration
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11_

- [ ] 14.1 Create Settings page structure

  - Create `src/pages/Settings.tsx`
  - Set up page layout with sections
  - Add page title
  - _Requirements: 10.1_

- [ ] 14.2 Implement settings data fetching

  - Create `useSettings` hook
  - Fetch data from `/api/v1/admin/settings`
  - Display current configuration
  - _Requirements: 10.1_

- [ ] 14.3 Create platform configuration form

  - Create form with all configuration fields
  - Add minimum withdrawal amount input
  - Add withdrawal fee percentage input
  - Add platform fee percentage input
  - Add toggle for user registration
  - Add toggle for task creation
  - Add toggle for withdrawals
  - Add toggle for maintenance mode
  - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [ ] 14.4 Implement form validation

  - Validate numeric inputs
  - Validate percentage ranges (0-100)
  - Validate minimum values
  - Show validation errors
  - _Requirements: 10.9_

- [ ] 14.5 Implement save settings functionality

  - Create `useUpdateSettings` mutation hook
  - Add save button
  - Call `/api/v1/admin/settings`
  - Show confirmation message on success
  - Show error message on failure
  - _Requirements: 10.9, 10.10_

- [ ] 15. Notification System

  - Implement notification store
  - Create notification dropdown component
  - Add real-time notification support
  - Implement notification actions
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [ ] 15.1 Create notification store

  - Create `src/store/notificationStore.ts`
  - Implement add notification action
  - Implement mark as read action
  - Implement mark all as read action
  - Implement clear notifications action
  - Track unread count
  - _Requirements: 11.5, 11.6, 11.7, 11.8_

- [ ] 15.2 Create notification dropdown component

  - Create NotificationDropdown component
  - Display notification list
  - Show unread badge on bell icon
  - Add mark as read on click
  - Add mark all as read button
  - Add clear all button
  - _Requirements: 11.5, 11.6, 11.7, 11.8_

- [ ] 15.3 Implement real-time notifications

  - Set up polling for new notifications
  - Fetch from `/api/v1/admin/notifications`
  - Add notifications to store
  - Show toast for critical notifications
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 15.4 Implement notification navigation

  - Add click handler to navigate to relevant page
  - Mark notification as read on click
  - _Requirements: 11.6_

- [ ] 16. Responsive Design and Mobile Support

  - Implement responsive layouts for all pages
  - Add mobile navigation drawer
  - Optimize tables for mobile view
  - Test on different screen sizes
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_

- [ ] 16.1 Implement responsive DashboardLayout

  - Make sidebar collapsible on mobile
  - Add hamburger menu button
  - Implement mobile drawer
  - Adjust header for mobile
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 16.2 Make DataTable responsive

  - Add horizontal scroll for tables on mobile
  - Implement card view option for mobile
  - Adjust column widths for smaller screens
  - _Requirements: 15.5_

- [ ] 16.3 Optimize forms for mobile

  - Stack form fields vertically on mobile
  - Increase touch target sizes
  - Adjust input sizes for mobile
  - _Requirements: 15.6_

- [ ] 16.4 Test responsive design

  - Test on desktop (1920x1080)
  - Test on laptop (1366x768)
  - Test on tablet (768x1024)
  - Test on mobile (375x667)
  - Fix any layout issues
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_

- [ ] 17. Accessibility Implementation

  - Add ARIA labels to all interactive elements
  - Implement keyboard navigation
  - Ensure color contrast compliance
  - Add focus indicators
  - Test with screen readers
  - _Requirements: 15.7, 15.8, 15.9, 15.10_

- [ ] 17.1 Add ARIA labels and roles

  - Add aria-label to buttons without text
  - Add role attributes to custom components
  - Add aria-describedby for form inputs
  - Add aria-live for dynamic content
  - _Requirements: 15.7_

- [ ] 17.2 Implement keyboard navigation

  - Ensure all interactive elements are keyboard accessible
  - Add keyboard shortcuts for common actions
  - Implement focus trap in modals
  - Add skip to content link
  - _Requirements: 15.8_

- [ ] 17.3 Ensure color contrast

  - Check all text against backgrounds
  - Adjust colors to meet WCAG AA standards
  - Test with color contrast checker
  - _Requirements: 15.7_

- [ ] 17.4 Add focus indicators

  - Style focus states for all interactive elements
  - Ensure focus indicators are visible
  - Test focus order
  - _Requirements: 15.8_

- [ ] 18. Error Handling and Loading States

  - Implement error boundary component
  - Add loading states to all data fetching
  - Create error display components
  - Add retry functionality
  - _Requirements: 15.9, 15.10_

- [ ] 18.1 Create ErrorBoundary component

  - Implement error boundary class component
  - Add error display UI
  - Add reload button
  - Log errors to console
  - _Requirements: 15.10_

- [ ] 18.2 Add loading states

  - Add LoadingSpinner to all pages
  - Show skeleton loaders for tables
  - Add loading state to buttons during actions
  - _Requirements: 15.9_

- [ ] 18.3 Create error display components

  - Create ErrorMessage component
  - Create EmptyState component
  - Add retry button to error states
  - _Requirements: 15.10_

- [ ] 18.4 Implement API error handling

  - Handle network errors
  - Handle authentication errors
  - Handle validation errors
  - Display user-friendly error messages
  - _Requirements: 15.10_

- [ ] 19. Testing and Quality Assurance

  - Write unit tests for utility functions
  - Write integration tests for key flows
  - Perform manual testing
  - Fix identified bugs
  - _Requirements: All_

- [ ] 19.1 Write unit tests

  - Test formatters (currency, date, etc.)
  - Test validators
  - Test store actions
  - Test custom hooks
  - _Requirements: All_

- [ ] 19.2 Write integration tests

  - Test login flow
  - Test user management flow
  - Test task approval flow
  - Test withdrawal approval flow
  - _Requirements: All_

- [ ] 19.3 Perform manual testing

  - Test all pages and features
  - Test on different browsers
  - Test on different devices
  - Create bug list
  - _Requirements: All_

- [ ] 19.4 Fix identified bugs

  - Fix critical bugs
  - Fix high priority bugs
  - Fix medium priority bugs
  - Document known issues
  - _Requirements: All_

- [ ] 20. Documentation and Deployment

  - Update README with setup instructions
  - Create deployment guide
  - Configure production build
  - Deploy to hosting platform
  - _Requirements: All_

- [ ] 20.1 Update README

  - Add project description
  - Add setup instructions
  - Add environment variables documentation
  - Add development commands
  - Add deployment instructions
  - _Requirements: All_

- [ ] 20.2 Configure production build

  - Update vite.config.ts for production
  - Configure environment variables
  - Optimize bundle size
  - Enable source maps for debugging
  - _Requirements: All_

- [ ] 20.3 Deploy to hosting platform

  - Choose hosting platform (Vercel/Netlify)
  - Configure deployment settings
  - Set up environment variables
  - Deploy application
  - Test production deployment
  - _Requirements: All_

- [ ] 20.4 Set up monitoring
  - Configure error tracking (Sentry)
  - Set up analytics (Google Analytics)
  - Monitor performance metrics
  - Set up uptime monitoring
  - _Requirements: All_
