# Admin Panel Design Document

## Overview

The Earn9ja Admin Panel is a modern, responsive web application built with React 19, TypeScript, Vite, TailwindCSS v4, and DaisyUI v5. The application follows a component-based architecture with centralized state management using Zustand, data fetching with React Query, and routing with React Router v6. The admin panel communicates with the existing Earn9ja backend API and provides a comprehensive interface for platform administration.

### Design Principles

1. **User-Centric**: Intuitive navigation and clear information hierarchy
2. **Performance**: Optimized data fetching with caching and pagination
3. **Responsive**: Mobile-first design that works on all screen sizes
4. **Accessible**: WCAG 2.1 AA compliant with keyboard navigation support
5. **Maintainable**: Modular components with clear separation of concerns
6. **Secure**: Role-based access control and secure API communication

### Technology Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + DaisyUI v5
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Charts**: Recharts (for analytics)
- **Date Handling**: date-fns
- **Form Validation**: Zod

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Panel (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Layouts    │     │
│  └──────┘  └──────────────┘  └──────────────┘   ───────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Stores     │  │    Hooks     │  │   Services   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Earn9ja Backend API                         │
│  /api/v1/admin/* endpoints                                   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
admin/
├── public/
│   └── assets/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── tasks/
│   │   ├── withdrawals/
│   │   ├── disputes/
│   │   ├── analytics/
│   │   └── settings/
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── pages/
│   │   ├── auth/
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Tasks.tsx
│   │   ├── Withdrawals.tsx
│   │   ├── Disputes.tsx
│   │   ├── Analytics.tsx
│   │   ├── KYC.tsx
│   │   ├── Support.tsx
│   │   ├── ActivityLog.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useTasks.ts
│   │   ├── useWithdrawals.ts
│   │   └── useAnalytics.ts
│   ├── services/
│   │   └── api.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── notificationStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── task.types.ts
│   │   ├── withdrawal.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Components and Interfaces

### Core Components

#### 1. DashboardLayout

The main layout component that wraps all authenticated pages.

**Props:**

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}
```

**Features:**

- Sidebar navigation with collapsible menu
- Top navigation bar with user profile and notifications
- Breadcrumb navigation
- Responsive design with mobile drawer

**Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo, Search, Notifications, Profile)         │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │           Main Content Area                 │
│          │                                              │
│ - Dash   │  ┌────────────────────────────────────┐    │
│ - Users  │  │                                    │    │
│ - Tasks  │  │        Page Content                │    │
│ - With.  │  │                                    │    │
│ - Disp.  │  └────────────────────────────────────┘    │
│ - Analy. │                                              │
│ - KYC    │                                              │
│ - Supp.  │                                              │
│ - Log    │                                              │
│ - Sett.  │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

#### 2. StatCard

Displays key metrics on the dashboard.

**Props:**

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  description?: string;
}
```

#### 3. DataTable

Reusable table component with sorting, filtering, and pagination.

**Props:**

```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}
```

#### 4. FilterBar

Component for filtering and searching data.

**Props:**

```typescript
interface FilterBarProps {
  filters: Filter[];
  onFilterChange: (filters: Record<string, any>) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

interface Filter {
  key: string;
  label: string;
  type: "select" | "date" | "dateRange";
  options?: { value: string; label: string }[];
}
```

#### 5. Modal

Reusable modal component for dialogs and forms.

**Props:**

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}
```

#### 6. ConfirmDialog

Confirmation dialog for destructive actions.

**Props:**

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "error" | "info";
}
```

### Page Components

#### 1. Dashboard Page

**Route:** `/`

**Features:**

- Platform statistics overview
- Quick action buttons
- Recent activity feed
- Charts for key metrics

**Data Requirements:**

- GET `/api/v1/admin/stats` - Platform statistics
- Real-time updates via polling or WebSocket

**Components:**

- StatCard (multiple instances)
- QuickActions
- RecentActivity
- MetricsChart

#### 2. Users Page

**Route:** `/users`

**Features:**

- User list with pagination
- Filter by status, role, KYC status
- Search by name, email, phone
- User detail modal
- Bulk actions (suspend, ban, notify)

**Data Requirements:**

- GET `/api/v1/admin/users` - User list with filters
- GET `/api/v1/admin/users/:userId` - User details
- POST `/api/v1/admin/users/:userId/suspend` - Suspend user
- POST `/api/v1/admin/users/:userId/ban` - Ban user
- POST `/api/v1/admin/users/:userId/reactivate` - Reactivate user

**Components:**

- DataTable
- FilterBar
- UserDetailModal
- BulkActionBar

#### 3. Tasks Page

**Route:** `/tasks`

**Features:**

- Task list with pagination
- Filter by status, category
- Search by title, description
- Task detail modal
- Approve/reject actions

**Data Requirements:**

- GET `/api/v1/admin/tasks/pending` - Pending tasks
- POST `/api/v1/admin/tasks/:taskId/approve` - Approve task
- POST `/api/v1/admin/tasks/:taskId/reject` - Reject task

**Components:**

- DataTable
- FilterBar
- TaskDetailModal
- TaskActionButtons

#### 4. Withdrawals Page

**Route:** `/withdrawals`

**Features:**

- Withdrawal list with pagination
- Filter by status, method
- Search by user, reference
- Withdrawal detail modal
- Approve/reject actions
- Bulk approval

**Data Requirements:**

- GET `/api/v1/admin/withdrawals/pending` - Pending withdrawals
- POST `/api/v1/admin/withdrawals/:withdrawalId/approve` - Approve withdrawal
- POST `/api/v1/admin/withdrawals/:withdrawalId/reject` - Reject withdrawal

**Components:**

- DataTable
- FilterBar
- WithdrawalDetailModal
- WithdrawalActionButtons
- BulkActionBar

#### 5. Disputes Page

**Route:** `/disputes`

**Features:**

- Dispute list with pagination
- Filter by status, type
- Dispute detail view
- Resolution form
- Evidence viewer

**Data Requirements:**

- GET `/api/v1/admin/disputes/pending` - Pending disputes
- GET `/api/v1/admin/disputes/:disputeId` - Dispute details
- POST `/api/v1/admin/disputes/:disputeId/resolve` - Resolve dispute
- PATCH `/api/v1/admin/disputes/:disputeId/status` - Update status

**Components:**

- DataTable
- FilterBar
- DisputeDetailView
- ResolutionForm
- EvidenceViewer

#### 6. Analytics Page

**Route:** `/analytics`

**Features:**

- Date range selector
- User growth charts
- Task completion charts
- Revenue charts
- AdMob analytics
- Export functionality

**Data Requirements:**

- GET `/api/v1/admin/stats` - Platform statistics
- GET `/api/v1/admin/revenue-report` - Revenue report
- GET `/api/v1/admin-analytics/admob` - AdMob analytics

**Components:**

- DateRangePicker
- LineChart
- BarChart
- PieChart
- MetricsGrid
- ExportButton

#### 7. KYC Page

**Route:** `/kyc`

**Features:**

- KYC submission list
- Filter by status, type
- Document viewer
- Approve/reject/resubmit actions

**Data Requirements:**

- GET `/api/v1/admin/kyc/pending` - Pending KYC submissions
- GET `/api/v1/admin/kyc/:kycId` - KYC details
- POST `/api/v1/admin/kyc/:kycId/approve` - Approve KYC
- POST `/api/v1/admin/kyc/:kycId/reject` - Reject KYC
- POST `/api/v1/admin/kyc/:kycId/resubmit` - Request resubmission

**Components:**

- DataTable
- FilterBar
- KYCDetailModal
- DocumentViewer
- KYCActionButtons

#### 8. Support Page

**Route:** `/support`

**Features:**

- Ticket list with pagination
- Filter by status, category, priority
- Ticket detail view
- Response form
- Ticket assignment

**Data Requirements:**

- GET `/api/v1/admin/support/tickets` - Support tickets
- GET `/api/v1/admin/support/tickets/:ticketId` - Ticket details
- POST `/api/v1/admin/support/tickets/:ticketId/respond` - Add response
- PATCH `/api/v1/admin/support/tickets/:ticketId/status` - Update status
- PATCH `/api/v1/admin/support/tickets/:ticketId/assign` - Assign ticket

**Components:**

- DataTable
- FilterBar
- TicketDetailView
- ResponseForm
- TicketActionButtons

## Data Models

### User Interface Types

```typescript
interface User {
  _id: string;
  email: string;
  phoneNumber: string;
  roles: ("service_worker" | "sponsor" | "admin")[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    gender?: string;
    location?: {
      state: string;
      city: string;
    };
    language: string;
  };
  reputation: {
    score: number;
    level: number;
    totalTasksCompleted: number;
    approvalRate: number;
    averageCompletionTime?: number;
    badges: string[];
    ratings: {
      average: number;
      count: number;
    };
  };
  walletId?: {
    availableBalance: number;
    lifetimeEarnings: number;
    lifetimeSpending: number;
  };
  isKYCVerified: boolean;
  status: "active" | "suspended" | "banned" | "pending_verification";
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  _id: string;
  sponsorId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  title: string;
  description: string;
  category: "social_media" | "music" | "survey" | "review" | "game" | "ads";
  platform: string;
  taskType: string;
  targetUrl?: string;
  reward: number;
  totalSlots: number;
  availableSlots: number;
  completedSlots: number;
  requirements: string[];
  proofRequirements: {
    type: "screenshot" | "link" | "video" | "text";
    description: string;
    required: boolean;
  }[];
  estimatedTime: number;
  expiresAt: Date;
  status: "draft" | "active" | "paused" | "completed" | "expired" | "cancelled";
  metadata: {
    platformName?: string;
    taskTypeName?: string;
    icon?: string;
    color?: string;
  };
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Withdrawal {
  _id: string;
  userId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
    phoneNumber: string;
  };
  amount: number;
  method: "bank_transfer" | "opay" | "palmpay";
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    phoneNumber?: string;
  };
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  fee: number;
  netAmount: number;
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Dispute {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    category: string;
    reward: number;
  };
  submissionId: string;
  reportedBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  reportedAgainst: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
  type: "task_not_completed" | "payment_issue" | "fraud" | "other";
  description: string;
  evidence: {
    type: "image" | "video" | "link" | "text";
    url?: string;
    content?: string;
  }[];
  status: "pending" | "under_review" | "resolved" | "rejected";
  resolution?: {
    decision: string;
    action: "refund_worker" | "refund_sponsor" | "no_action" | "ban_user";
    resolvedBy: string;
    resolvedAt: Date;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PlatformStats {
  users: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    active: number;
    completed: number;
  };
  financials: {
    totalRevenue: number;
    totalPayouts: number;
    pendingWithdrawals: number;
  };
}
```

## State Management

### Auth Store (Zustand)

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

**Responsibilities:**

- Store authentication token
- Store current admin user
- Handle login/logout
- Token refresh logic

### Notification Store (Zustand)

```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "withdrawal" | "dispute" | "support" | "fraud";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
```

**Responsibilities:**

- Store real-time notifications
- Track unread count
- Manage notification lifecycle

### UI Store (Zustand)

```typescript
interface UIState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}
```

**Responsibilities:**

- UI preferences
- Sidebar state
- Theme selection

## API Service Layer

### API Client Configuration

```typescript
// src/services/api.ts
import axios from "axios";
import { authStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Service Methods

```typescript
// User Management
export const userService = {
  getUsers: (params: UserFilters) => api.get("/admin/users", { params }),
  getUserDetails: (userId: string) => api.get(`/admin/users/${userId}`),
  suspendUser: (userId: string, reason: string) =>
    api.post(`/admin/users/${userId}/suspend`, { reason }),
  banUser: (userId: string, reason: string) =>
    api.post(`/admin/users/${userId}/ban`, { reason }),
  reactivateUser: (userId: string) =>
    api.post(`/admin/users/${userId}/reactivate`),
};

// Task Management
export const taskService = {
  getPendingTasks: (params: TaskFilters) =>
    api.get("/admin/tasks/pending", { params }),
  approveTask: (taskId: string) => api.post(`/admin/tasks/${taskId}/approve`),
  rejectTask: (taskId: string, reason: string) =>
    api.post(`/admin/tasks/${taskId}/reject`, { reason }),
};

// Withdrawal Management
export const withdrawalService = {
  getPendingWithdrawals: (params: WithdrawalFilters) =>
    api.get("/admin/withdrawals/pending", { params }),
  approveWithdrawal: (withdrawalId: string) =>
    api.post(`/admin/withdrawals/${withdrawalId}/approve`),
  rejectWithdrawal: (withdrawalId: string, reason: string) =>
    api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason }),
};

// Analytics
export const analyticsService = {
  getPlatformStats: () => api.get("/admin/stats"),
  getRevenueReport: (startDate: string, endDate: string) =>
    api.get("/admin/revenue-report", { params: { startDate, endDate } }),
  getAdMobAnalytics: (params: AnalyticsParams) =>
    api.get("/admin-analytics/admob", { params }),
};
```

## Custom Hooks

### useUsers Hook

```typescript
export const useUsers = (filters: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => userService.getUsers(filters),
    staleTime: 30000, // 30 seconds
  });
};

export const useUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserDetails(userId),
    enabled: !!userId,
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      userService.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User suspended successfully");
    },
    onError: (error) => {
      toast.error("Failed to suspend user");
    },
  });
};
```

### useTasks Hook

```typescript
export const useTasks = (filters: TaskFilters) => {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.getPendingTasks(filters),
    staleTime: 30000,
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskService.approveTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve task");
    },
  });
};
```

### useWithdrawals Hook

```typescript
export const useWithdrawals = (filters: WithdrawalFilters) => {
  return useQuery({
    queryKey: ["withdrawals", filters],
    queryFn: () => withdrawalService.getPendingWithdrawals(filters),
    staleTime: 30000,
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (withdrawalId: string) =>
      withdrawalService.approveWithdrawal(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      toast.success("Withdrawal approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve withdrawal");
    },
  });
};
```

### useAnalytics Hook

```typescript
export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => analyticsService.getPlatformStats(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto-refresh every minute
  });
};

export const useRevenueReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["revenue-report", startDate, endDate],
    queryFn: () => analyticsService.getRevenueReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};
```

## Error Handling

### Error Boundary Component

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Log to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || "An error occurred";
  } else if (error.request) {
    // Request made but no response
    return "Network error. Please check your connection.";
  } else {
    // Something else happened
    return error.message || "An unexpected error occurred";
  }
};
```

## Testing Strategy

### Unit Testing

**Tools:** Vitest, React Testing Library

**Coverage:**

- Utility functions (formatters, validators)
- Custom hooks
- Store actions
- Component logic

**Example:**

```typescript
describe("formatCurrency", () => {
  it("should format Nigerian Naira correctly", () => {
    expect(formatCurrency(1000)).toBe("₦1,000");
    expect(formatCurrency(1000.5)).toBe("₦1,000.50");
  });
});
```

### Integration Testing

**Tools:** Vitest, React Testing Library, MSW (Mock Service Worker)

**Coverage:**

- API service methods
- Component interactions with API
- Form submissions
- Navigation flows

**Example:**

```typescript
describe("Users Page", () => {
  it("should load and display users", async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("should suspend user when action is clicked", async () => {
    render(<UsersPage />);
    const suspendButton = screen.getByText("Suspend");
    fireEvent.click(suspendButton);
    await waitFor(() => {
      expect(
        screen.getByText("User suspended successfully")
      ).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

**Tools:** Playwright

**Coverage:**

- Critical user flows
- Authentication
- Data management operations

**Example:**

```typescript
test("admin can approve withdrawal", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "admin@earn9ja.site");
  await page.fill('[name="password"]', "password");
  await page.click('button[type="submit"]');

  await page.goto("/withdrawals");
  await page.click("text=Approve");
  await page.click("text=Confirm");

  await expect(page.locator("text=Withdrawal approved")).toBeVisible();
});
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const Tasks = lazy(() => import("./pages/Tasks"));

// Route configuration
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/users" element={<Users />} />
    <Route path="/tasks" element={<Tasks />} />
  </Routes>
</Suspense>;
```

### Data Caching

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Virtual Scrolling

For large lists (1000+ items), implement virtual scrolling using `react-virtual`:

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

const VirtualList = ({ items }) => {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{ height: `${virtualItem.size}px` }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Image Optimization

```typescript
// Use lazy loading for images
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
  className="w-full h-auto"
/>

// Use responsive images
<picture>
  <source srcSet={`${imageUrl}?w=400`} media="(max-width: 640px)" />
  <source srcSet={`${imageUrl}?w=800`} media="(max-width: 1024px)" />
  <img src={`${imageUrl}?w=1200`} alt="Description" />
</picture>
```

## Security Considerations

### Authentication

1. **JWT Token Storage**: Store tokens in memory (Zustand store) and use httpOnly cookies for refresh tokens
2. **Token Expiration**: Implement automatic token refresh before expiration
3. **Logout on Inactivity**: Auto-logout after 30 minutes of inactivity
4. **Secure Password Requirements**: Enforce strong password policies

### Authorization

1. **Role-Based Access Control**: Verify admin role on every protected route
2. **API Authorization**: Include JWT token in all API requests
3. **Route Guards**: Protect all admin routes with authentication check

```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.roles.includes("admin")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Data Protection

1. **Input Sanitization**: Sanitize all user inputs before sending to API
2. **XSS Prevention**: Use React's built-in XSS protection, avoid dangerouslySetInnerHTML
3. **CSRF Protection**: Include CSRF tokens in state-changing requests
4. **Content Security Policy**: Configure CSP headers in production

### API Security

1. **HTTPS Only**: Enforce HTTPS in production
2. **Rate Limiting**: Respect API rate limits
3. **Error Messages**: Don't expose sensitive information in error messages
4. **Audit Logging**: Log all administrative actions

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader Support**: Proper ARIA labels and roles
3. **Color Contrast**: Minimum 4.5:1 contrast ratio for text
4. **Focus Indicators**: Visible focus states for all interactive elements
5. **Alt Text**: Descriptive alt text for all images
6. **Form Labels**: Proper labels for all form inputs

### Implementation Examples

```typescript
// Accessible button
<button
  aria-label="Approve withdrawal"
  onClick={handleApprove}
  className="btn btn-primary"
>
  Approve
</button>

// Accessible modal
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
</div>

// Accessible table
<table role="table" aria-label="Users list">
  <thead>
    <tr role="row">
      <th role="columnheader">Name</th>
      <th role="columnheader">Email</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user._id} role="row">
        <td role="cell">{user.profile.firstName}</td>
        <td role="cell">{user.email}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Deployment

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["@tanstack/react-query", "zustand"],
          "chart-vendor": ["recharts"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      },
    },
  },
});
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.earn9ja.site/api/v1
VITE_APP_NAME=Earn9ja Admin
VITE_APP_VERSION=1.0.0
```

### Deployment Platforms

**Recommended:** Vercel or Netlify

**Vercel Configuration:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@vite-api-url"
  }
}
```

**Netlify Configuration:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Admin Panel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Monitoring and Analytics

### Error Tracking

**Tool:** Sentry

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

```typescript
// Track page load times
useEffect(() => {
  const navigationTiming = performance.getEntriesByType("navigation")[0];
  console.log(
    "Page load time:",
    navigationTiming.loadEventEnd - navigationTiming.fetchStart
  );
}, []);

// Track API response times
api.interceptors.response.use((response) => {
  const duration = Date.now() - response.config.metadata.startTime;
  console.log(`API ${response.config.url} took ${duration}ms`);
  return response;
});
```

### User Analytics

**Tool:** Google Analytics or Mixpanel

```typescript
// Track page views
useEffect(() => {
  gtag("event", "page_view", {
    page_path: location.pathname,
  });
}, [location]);

// Track user actions
const trackAction = (action: string, category: string) => {
  gtag("event", action, {
    event_category: category,
  });
};
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket for live data updates
2. **Advanced Filtering**: Add saved filter presets
3. **Bulk Import/Export**: CSV import for bulk operations
4. **Custom Reports**: Report builder with custom metrics
5. **Mobile App**: Native mobile app for on-the-go management
6. **AI-Powered Insights**: Fraud detection and anomaly detection
7. **Multi-language Support**: Internationalization (i18n)
8. **Dark Mode**: Full dark mode support
9. **Customizable Dashboard**: Drag-and-drop widget customization
10. **Advanced Permissions**: Granular permission system for different admin roles
