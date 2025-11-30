# Design Document

## Overview

This document outlines the technical design for a React Native Expo mobile application that enables task-based earning in the Nigerian market. The platform connects Service Workers who complete tasks with Sponsors who create campaigns, overseen by Admins. The architecture prioritizes scalability, security, and offline-first capabilities while supporting multiple payment gateways and real-time interactions.

### Technology Stack

**Frontend:**

- React Native (latest stable) with Expo SDK 50+
- TypeScript for type safety
- React Navigation 6.x for routing
- React Query (TanStack Query v5) for server state management, API caching, and data fetching
- Zustand for lightweight client state management (auth, UI state)
- React Native Paper for UI components with custom theming
- Expo modules: expo-auth-session, expo-notifications, expo-secure-store, expo-image-picker, expo-camera, expo-sms

**Backend (MERN Stack):**

- Node.js with Express.js framework
- MongoDB with Mongoose ODM for all data storage (users, tasks, transactions, analytics)
- Redis for caching, session management, and real-time features
- Socket.io for real-time notifications and chat

**Third-Party Services:**

- Firebase Authentication for OAuth providers
- Google AdMob SDK for rewarded video ads
- Paystack/Flutterwave APIs for payment processing
- AWS S3 or Cloudinary for media storage
- Twilio for SMS verification
- SendGrid for email notifications

**DevOps:**

- Docker for containerization
- AWS/DigitalOcean for hosting
- GitHub Actions for CI/CD
- Sentry for error tracking
- Google Analytics/Mixpanel for user analytics

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Service    │  │   Sponsor    │  │    Admin     │      │
│  │   Worker UI  │  │      UI      │  │      UI      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Redux Store + RTK Query Cache              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   REST API    │
                    │   WebSocket   │
                    └───────┬───────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     API      │  │   Auth       │  │   Payment    │      │
│  │   Gateway    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Task      │  │   Wallet     │  │   Notif.     │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Analytics  │  │    Fraud     │  │    Admin     │      │
│  │   Service    │  │  Detection   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌────────▼────────┐  ┌──────▼──────┐
│   MongoDB     │  │     Redis       │  │   S3/CDN    │
│   (Primary)   │  │    (Cache)      │  │   (Media)   │
└───────────────┘  └─────────────────┘  └─────────────┘
```

### Backend Architecture (MERN Stack)

The backend uses Express.js with modular service architecture:

1. **API Gateway/Router**: Routes requests, handles authentication, rate limiting
2. **Auth Service**: User registration, login, KYC verification, JWT session management
3. **Task Service**: Task CRUD, task matching, submission handling
4. **Wallet Service**: Balance management, escrow, transaction ledger
5. **Payment Service**: Integration with Paystack/Flutterwave, withdrawal processing
6. **Notification Service**: Push notifications via FCM, email via SendGrid, SMS via Twilio
7. **Analytics Service**: User behavior tracking, reporting, dashboards
8. **Fraud Detection Service**: Pattern analysis, multi-account detection
9. **Admin Service**: User management, moderation, dispute resolution
10. **AdMob Service**: Rewarded ad tracking, reward distribution, ad analytics

**MongoDB Collections:**

- users
- tasks
- task_submissions
- wallets
- transactions
- escrows
- referrals
- notifications
- disputes
- admin_logs
- fraud_reports
- admob_rewards

## Components and Interfaces

### Mobile App Component Structure

```
src/
├── assets/
│   ├── images/          # Custom splash screens, logos, illustrations
│   ├── icons/           # Custom iconography
│   └── animations/      # Lottie animations
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   └── EmptyState.tsx
│   ├── task/            # Task-related components
│   │   ├── TaskCard.tsx
│   │   ├── TaskFilter.tsx
│   │   ├── TaskDetails.tsx
│   │   └── ProofUpload.tsx
│   ├── wallet/          # Wallet components
│   │   ├── BalanceCard.tsx
│   │   ├── TransactionList.tsx
│   │   └── WithdrawalForm.tsx
│   └── navigation/      # Navigation components
│       ├── TabBar.tsx
│       └── Header.tsx
├── screens/
│   ├── auth/            # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   └── KYCScreen.tsx
│   ├── worker/          # Service Worker screens
│   │   ├── HomeScreen.tsx
│   │   ├── TaskBrowseScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   ├── WalletScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ReferralScreen.tsx
│   ├── sponsor/         # Sponsor screens
│   │   ├── DashboardScreen.tsx
│   │   ├── CreateTaskScreen.tsx
│   │   ├── ManageTasksScreen.tsx
│   │   ├── ReviewSubmissionsScreen.tsx
│   │   └── AnalyticsScreen.tsx
│   └── admin/           # Admin screens
│       ├── AdminDashboardScreen.tsx
│       ├── UserManagementScreen.tsx
│       ├── TaskModerationScreen.tsx
│       └── DisputeResolutionScreen.tsx
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── WorkerNavigator.tsx
│   ├── SponsorNavigator.tsx
│   └── AdminNavigator.tsx
├── api/
│   ├── client.ts         # Axios instance with interceptors
│   ├── queries/
│   │   ├── authQueries.ts
│   │   ├── taskQueries.ts
│   │   ├── walletQueries.ts
│   │   └── userQueries.ts
│   └── mutations/
│       ├── authMutations.ts
│       ├── taskMutations.ts
│       └── walletMutations.ts
├── store/
│   ├── authStore.ts      # Zustand store for auth state
│   ├── uiStore.ts        # Zustand store for UI state
│   └── index.ts
├── services/
│   ├── api.ts           # Axios instance configuration
│   ├── storage.ts       # Secure storage wrapper
│   ├── notifications.ts # Push notification handling
│   ├── admob.ts         # AdMob integration
│   └── analytics.ts     # Analytics tracking
├── utils/
│   ├── validation.ts    # Form validation helpers
│   ├── formatting.ts    # Currency, date formatting
│   ├── constants.ts     # App constants
│   └── helpers.ts       # Utility functions
├── hooks/
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useWallet.ts
│   └── useNotifications.ts
├── types/
│   ├── user.ts
│   ├── task.ts
│   ├── wallet.ts
│   └── api.ts
└── theme/
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

### Key Component Interfaces

#### Task Component

```typescript
interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
  showSponsor?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: number;
  estimatedTime: number;
  totalSlots: number;
  remainingSlots: number;
  sponsor: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  requirements: TaskRequirement[];
  proofType: ProofType[];
  status: TaskStatus;
  createdAt: Date;
  expiresAt?: Date;
}

enum TaskCategory {
  SOCIAL_MEDIA = "social_media",
  MUSIC_STREAMING = "music_streaming",
  SURVEY = "survey",
  PRODUCT_REVIEW = "product_review",
  GAME_REVIEW = "game_review",
  AD_WATCHING = "ad_watching",
}

enum ProofType {
  SCREENSHOT = "screenshot",
  LINK = "link",
  VIDEO = "video",
  TEXT = "text",
}
```

#### Wallet Component

```typescript
interface WalletState {
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  transactions: Transaction[];
  isLoading: boolean;
}

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

enum TransactionType {
  TASK_EARNING = "task_earning",
  REFERRAL_BONUS = "referral_bonus",
  DAILY_BONUS = "daily_bonus",
  WITHDRAWAL = "withdrawal",
  TASK_FUNDING = "task_funding",
  REFUND = "refund",
}
```

### Backend API Endpoints

#### Authentication Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-phone
POST   /api/v1/auth/social-login
```

#### User Endpoints

```
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
POST   /api/v1/users/kyc
GET    /api/v1/users/kyc-status
PUT    /api/v1/users/preferences
POST   /api/v1/users/avatar
```

#### Task Endpoints

```
GET    /api/v1/tasks                    # Browse tasks with filters
GET    /api/v1/tasks/:id                # Get task details
POST   /api/v1/tasks                    # Create task (Sponsor)
PUT    /api/v1/tasks/:id                # Update task (Sponsor)
DELETE /api/v1/tasks/:id                # Delete task (Sponsor)
POST   /api/v1/tasks/:id/accept         # Accept task (Worker)
POST   /api/v1/tasks/:id/submit         # Submit completion (Worker)
GET    /api/v1/tasks/:id/submissions    # Get submissions (Sponsor)
POST   /api/v1/tasks/submissions/:id/review  # Approve/reject (Sponsor)
GET    /api/v1/tasks/my-tasks           # Worker's accepted tasks
GET    /api/v1/tasks/my-campaigns       # Sponsor's created tasks
```

#### Wallet Endpoints

```
GET    /api/v1/wallet/balance
GET    /api/v1/wallet/transactions
POST   /api/v1/wallet/withdraw
POST   /api/v1/wallet/topup             # Sponsor funding
GET    /api/v1/wallet/withdrawal-methods
GET    /api/v1/wallet/earnings-forecast
```

#### Admin Endpoints

```
GET    /api/v1/admin/users
PUT    /api/v1/admin/users/:id/suspend
PUT    /api/v1/admin/users/:id/ban
GET    /api/v1/admin/tasks/pending
PUT    /api/v1/admin/tasks/:id/approve
GET    /api/v1/admin/disputes
PUT    /api/v1/admin/disputes/:id/resolve
GET    /api/v1/admin/analytics
GET    /api/v1/admin/fraud-reports
```

#### Notification Endpoints

```
GET    /api/v1/notifications
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
POST   /api/v1/notifications/preferences
POST   /api/v1/notifications/register-device  # FCM token
```

#### Analytics Endpoints

```
GET    /api/v1/analytics/worker/dashboard
GET    /api/v1/analytics/sponsor/campaign/:id
GET    /api/v1/analytics/sponsor/overview
GET    /api/v1/analytics/admin/platform
```

## Data Models (MongoDB/Mongoose Schemas)

### User Model

```typescript
import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  phoneNumber: string;
  passwordHash: string;
  roles: UserRole[];
  profile: UserProfile;
  kyc: KYCData;
  preferences: UserPreferences;
  reputation: ReputationData;
  walletId: mongoose.Types.ObjectId;
  lastLoginAt: Date;
  status: UserStatus;
  deviceIds: string[];
  ipAddresses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    roles: [{ type: String, enum: ["service_worker", "sponsor", "admin"] }],
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      dateOfBirth: Date,
      gender: String,
      location: {
        state: String,
        city: String,
      },
      language: { type: String, default: "en" },
    },
    kyc: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      nin: String,
      bvn: String,
      documents: [
        {
          type: String,
          url: String,
          verifiedAt: Date,
        },
      ],
      verifiedAt: Date,
      rejectionReason: String,
    },
    preferences: {
      notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      language: { type: String, default: "en" },
    },
    reputation: {
      score: { type: Number, default: 50, min: 0, max: 100 },
      level: { type: Number, default: 1 },
      totalTasksCompleted: { type: Number, default: 0 },
      approvalRate: { type: Number, default: 100 },
      averageCompletionTime: Number,
      badges: [String],
      ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
      },
    },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    lastLoginAt: Date,
    status: {
      type: String,
      enum: ["active", "suspended", "banned", "pending_verification"],
      default: "active",
    },
    deviceIds: [String],
    ipAddresses: [String],
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ "reputation.score": -1 });
userSchema.index({ status: 1 });

export const User = mongoose.model<IUser>("User", userSchema);

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  location?: {
    state: string;
    city: string;
  };
  language: string;
}

interface KYCData {
  status: KYCStatus;
  nin?: string;
  bvn?: string;
  documents: {
    type: string;
    url: string;
    verifiedAt?: Date;
  }[];
  verifiedAt?: Date;
  rejectionReason?: string;
}

interface ReputationData {
  score: number;
  level: number;
  totalTasksCompleted: number;
  approvalRate: number;
  averageCompletionTime: number;
  badges: Badge[];
  ratings: {
    average: number;
    count: number;
  };
}

enum UserRole {
  SERVICE_WORKER = "service_worker",
  SPONSOR = "sponsor",
  ADMIN = "admin",
}

enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
  PENDING_VERIFICATION = "pending_verification",
}
```

### Task Model

```typescript
interface Task {
  id: string;
  sponsorId: string;
  title: string;
  description: string;
  category: TaskCategory;
  subcategory?: string;
  platform?: string;
  reward: number;
  totalSlots: number;
  completedSlots: number;
  remainingSlots: number;
  requirements: TaskRequirement[];
  proofRequirements: ProofRequirement[];
  targetAudience?: {
    minReputation?: number;
    minLevel?: number;
    locations?: string[];
  };
  status: TaskStatus;
  autoApprove: boolean;
  autoApproveAfterHours?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface TaskRequirement {
  type: string;
  description: string;
  value?: any;
}

interface ProofRequirement {
  type: ProofType;
  required: boolean;
  description: string;
  minCount?: number;
  maxCount?: number;
}

enum TaskStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}
```

### Task Submission Model

```typescript
interface TaskSubmission {
  id: string;
  taskId: string;
  workerId: string;
  proofs: Proof[];
  status: SubmissionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  autoApprovedAt?: Date;
  metadata: Record<string, any>;
}

interface Proof {
  type: ProofType;
  url?: string;
  text?: string;
  metadata?: Record<string, any>;
  uploadedAt: Date;
}

enum SubmissionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  DISPUTED = "disputed",
}
```

### Wallet Model

```typescript
interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  escrowBalance: number;
  lifetimeEarnings: number;
  lifetimeSpending: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  referenceType?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: PaymentMethod;
  destination: PaymentDestination;
  status: WithdrawalStatus;
  transactionId?: string;
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
}

interface PaymentDestination {
  type: PaymentMethod;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  walletAddress?: string;
  phoneNumber?: string;
}

enum PaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  PAYSTACK = "paystack",
  FLUTTERWAVE = "flutterwave",
  OPAY = "opay",
  PALMPAY = "palmpay",
  CRYPTO = "crypto",
}

enum WithdrawalStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}
```

### Escrow Model

```typescript
interface Escrow {
  id: string;
  taskId: string;
  sponsorId: string;
  totalAmount: number;
  reservedAmount: number;
  releasedAmount: number;
  refundedAmount: number;
  platformFee: number;
  status: EscrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

enum EscrowStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund",
}
```

### Referral Model

```typescript
interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: ReferralStatus;
  bonusPaid: number;
  commissionEarned: number;
  commissionEndDate: Date;
  createdAt: Date;
}

enum ReferralStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  EXPIRED = "expired",
}
```

### Notification Model

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

enum NotificationType {
  TASK_AVAILABLE = "task_available",
  TASK_APPROVED = "task_approved",
  TASK_REJECTED = "task_rejected",
  SUBMISSION_RECEIVED = "submission_received",
  WITHDRAWAL_COMPLETED = "withdrawal_completed",
  REFERRAL_BONUS = "referral_bonus",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
}
```

### Dispute Model

```typescript
interface Dispute {
  id: string;
  submissionId: string;
  taskId: string;
  workerId: string;
  sponsorId: string;
  initiatedBy: string;
  reason: string;
  description: string;
  evidence: Evidence[];
  status: DisputeStatus;
  assignedAdminId?: string;
  resolution?: DisputeResolution;
  createdAt: Date;
  resolvedAt?: Date;
}

interface Evidence {
  type: string;
  url: string;
  description: string;
  uploadedAt: Date;
}

interface DisputeResolution {
  decision: DisputeDecision;
  notes: string;
  resolvedBy: string;
  resolvedAt: Date;
}

enum DisputeStatus {
  OPEN = "open",
  UNDER_REVIEW = "under_review",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

enum DisputeDecision {
  APPROVE_TASK = "approve_task",
  REJECT_TASK = "reject_task",
  PARTIAL_PAYMENT = "partial_payment",
  REFUND_SPONSOR = "refund_sponsor",
}
```

## Visual Assets and Branding Design

### Design System

#### Color Palette

```typescript
const colors = {
  primary: {
    main: "#00A86B", // Nigerian green
    light: "#33C088",
    dark: "#007A4D",
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#FFB800", // Gold/reward color
    light: "#FFC933",
    dark: "#CC9300",
    contrast: "#000000",
  },
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  background: {
    default: "#F9FAFB",
    paper: "#FFFFFF",
    dark: "#1F2937",
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    disabled: "#9CA3AF",
    inverse: "#FFFFFF",
  },
  border: "#E5E7EB",
  divider: "#F3F4F6",
};
```

#### Typography

```typescript
const typography = {
  fontFamily: {
    regular: "Inter-Regular",
    medium: "Inter-Medium",
    semibold: "Inter-SemiBold",
    bold: "Inter-Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Custom Visual Assets

#### 1. App Icon Design

**Requirements:**

- Sizes: 1024x1024 (iOS), 512x512 (Android), 192x192, 48x48
- Format: PNG with transparency
- Design elements:
  - Incorporate Nigerian colors (green, white)
  - Symbol representing tasks/earning (checkmark, coin, or hand)
  - Modern, flat design style
  - Recognizable at small sizes

**Implementation approach:**

- Create base SVG design
- Export to required PNG sizes
- Use Expo's app.json to configure icons

#### 2. Splash Screen Design

**Requirements:**

- Dimensions: 1242x2436 (iOS), 1080x1920 (Android)
- Format: PNG
- Design elements:
  - App logo centered
  - Brand colors background (gradient from primary to secondary)
  - Optional: Loading animation using Lottie
  - Tagline: "Earn While You Engage"

**Implementation:**

```typescript
// app.json splash configuration
{
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#00A86B"
  }
}
```

#### 3. Onboarding Illustrations

**Screens:**

1. **Welcome Screen**: Illustration of person with phone and money symbols
2. **Service Worker Screen**: Person completing tasks with checkmarks
3. **Sponsor Screen**: Business person creating campaigns
4. **Earning Screen**: Wallet with coins flowing in

**Design specifications:**

- Style: Flat, modern illustrations with Nigerian representation
- Colors: Use primary and secondary palette
- Format: SVG for scalability
- Size: 300x300px display area

#### 4. Empty State Illustrations

**Required empty states:**

1. **No Tasks Available**: Empty task board with magnifying glass
2. **No Earnings Yet**: Empty wallet with encouraging message
3. **No Notifications**: Bell icon with "All caught up" message
4. **No Submissions**: Clipboard with checkmark waiting
5. **No Referrals**: People icons with invitation gesture

**Design approach:**

- Minimalist, friendly illustrations
- Consistent style across all empty states
- Include encouraging micro-copy
- Format: SVG, 200x200px

#### 5. Custom Iconography

**Icon categories:**

**Task Categories:**

- Social Media: Thumbs up with network nodes
- Music Streaming: Musical note with play button
- Survey: Clipboard with checkboxes
- Product Review: Star with magnifying glass
- Game Review: Game controller
- Ad Watching: Play button with eye

**Navigation Icons:**

- Home: House outline
- Tasks: Checklist
- Wallet: Wallet/purse
- Profile: User circle
- More: Three dots

**Action Icons:**

- Accept Task: Plus in circle
- Submit: Upload arrow
- Approve: Checkmark in circle
- Reject: X in circle
- Filter: Funnel
- Search: Magnifying glass
- Notification: Bell
- Settings: Gear

**Design specifications:**

- Style: Outline icons with 2px stroke
- Size: 24x24px base size
- Format: SVG
- Color: Inherit from theme

#### 6. Task Category Badges

**Visual badges for each category:**

- Circular or rounded square badges
- Category icon in center
- Category color coding:
  - Social Media: Blue (#3B82F6)
  - Music: Purple (#8B5CF6)
  - Survey: Orange (#F59E0B)
  - Product Review: Pink (#EC4899)
  - Game: Red (#EF4444)
  - Ads: Green (#10B981)

#### 7. Achievement Badges

**Gamification badges:**

- First Task: Bronze medal
- 100 Tasks: Silver medal
- 1000 Tasks: Gold medal
- Perfect Week: Star with "7"
- Top Earner: Crown
- Referral Master: People with trophy

**Design:**

- Metallic/gradient effects
- 64x64px size
- PNG with transparency
- Celebratory style

#### 8. Loading Animations

**Lottie animations for:**

1. **Initial app load**: Coin spinning
2. **Task submission**: Checkmark animation
3. **Payment processing**: Money transfer animation
4. **Success states**: Confetti burst

**Implementation:**

```typescript
import LottieView from "lottie-react-native";

<LottieView
  source={require("./assets/animations/loading.json")}
  autoPlay
  loop
  style={{ width: 100, height: 100 }}
/>;
```

### Asset Organization

```
assets/
├── images/
│   ├── splash.png
│   ├── logo.png
│   ├── logo-white.png
│   └── onboarding/
│       ├── welcome.svg
│       ├── worker.svg
│       ├── sponsor.svg
│       └── earning.svg
├── icons/
│   ├── app-icon.png (multiple sizes)
│   ├── categories/
│   │   ├── social-media.svg
│   │   ├── music.svg
│   │   ├── survey.svg
│   │   ├── review.svg
│   │   ├── game.svg
│   │   └── ads.svg
│   ├── navigation/
│   │   ├── home.svg
│   │   ├── tasks.svg
│   │   ├── wallet.svg
│   │   └── profile.svg
│   └── actions/
│       ├── accept.svg
│       ├── submit.svg
│       ├── approve.svg
│       └── reject.svg
├── illustrations/
│   ├── empty-states/
│   │   ├── no-tasks.svg
│   │   ├── no-earnings.svg
│   │   ├── no-notifications.svg
│   │   └── no-submissions.svg
│   └── badges/
│       ├── first-task.png
│       ├── hundred-tasks.png
│       └── perfect-week.png
└── animations/
    ├── loading.json
    ├── success.json
    ├── payment.json
    └── confetti.json
```

### Design Tools and Generation

**Recommended tools for asset creation:**

1. **Figma**: Primary design tool for UI mockups and asset creation
2. **Canva**: Quick illustration and icon generation
3. **DALL-E/Midjourney**: AI-generated base illustrations (to be refined)
4. **Inkscape/Adobe Illustrator**: SVG editing and optimization
5. **LottieFiles**: Animation creation and export
6. **TinyPNG**: Image optimization

**Asset generation workflow:**

1. Create design concepts in Figma
2. Generate base illustrations using AI tools
3. Refine and customize in vector editor
4. Export in required formats and sizes
5. Optimize file sizes
6. Integrate into React Native project

## Error Handling

### Frontend Error Handling Strategy

#### Network Errors

```typescript
// API interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - refresh token or logout
          await handleTokenRefresh();
          break;
        case 403:
          // Forbidden - show access denied
          showError("Access denied");
          break;
        case 404:
          // Not found
          showError("Resource not found");
          break;
        case 429:
          // Rate limited
          showError("Too many requests. Please try again later.");
          break;
        case 500:
          // Server error
          showError("Server error. Please try again.");
          break;
        default:
          showError(error.response.data.message || "An error occurred");
      }
    } else if (error.request) {
      // Request made but no response
      showError("Network error. Please check your connection.");
    } else {
      // Something else happened
      showError("An unexpected error occurred");
    }
    return Promise.reject(error);
  }
);
```

#### Offline Handling

```typescript
// Network state monitoring
import NetInfo from "@react-native-community/netinfo";

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
};

// Queue offline actions
class OfflineQueue {
  private queue: Action[] = [];

  async add(action: Action) {
    this.queue.push(action);
    await AsyncStorage.setItem("offline_queue", JSON.stringify(this.queue));
  }

  async process() {
    const actions = [...this.queue];
    for (const action of actions) {
      try {
        await executeAction(action);
        this.queue = this.queue.filter((a) => a.id !== action.id);
      } catch (error) {
        console.error("Failed to process offline action", error);
      }
    }
    await AsyncStorage.setItem("offline_queue", JSON.stringify(this.queue));
  }
}
```

#### Form Validation Errors

```typescript
// Validation error display
interface ValidationError {
  field: string;
  message: string;
}

const handleValidationErrors = (errors: ValidationError[]) => {
  const errorMap = errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);

  setFieldErrors(errorMap);
};
```

#### Payment Errors

```typescript
enum PaymentErrorCode {
  INSUFFICIENT_BALANCE = "insufficient_balance",
  INVALID_ACCOUNT = "invalid_account",
  TRANSACTION_FAILED = "transaction_failed",
  GATEWAY_ERROR = "gateway_error",
  DAILY_LIMIT_EXCEEDED = "daily_limit_exceeded",
}

const handlePaymentError = (errorCode: PaymentErrorCode) => {
  const errorMessages = {
    [PaymentErrorCode.INSUFFICIENT_BALANCE]:
      "Insufficient balance. Please top up your wallet.",
    [PaymentErrorCode.INVALID_ACCOUNT]:
      "Invalid account details. Please check and try again.",
    [PaymentErrorCode.TRANSACTION_FAILED]:
      "Transaction failed. Please try again.",
    [PaymentErrorCode.GATEWAY_ERROR]:
      "Payment gateway error. Please try again later.",
    [PaymentErrorCode.DAILY_LIMIT_EXCEEDED]: "Daily withdrawal limit exceeded.",
  };

  showError(errorMessages[errorCode] || "Payment error occurred");
};
```

### Backend Error Handling

#### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Example error response
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "The requested task does not exist",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

#### Global Error Handler

```typescript
// Express error middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.id || generateId();

  // Log error
  logger.error({
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Send error response
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "Authentication failed",
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An internal error occurred",
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
});
```

#### Database Error Handling

```typescript
// Retry logic for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

// Transaction rollback
async function executeTransaction(operations: Operation[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const operation of operations) {
      await operation(client);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

#### Third-Party Service Errors

```typescript
// Payment gateway error handling
class PaymentService {
  async processWithdrawal(withdrawal: Withdrawal): Promise<void> {
    try {
      const result = await paymentGateway.transfer({
        amount: withdrawal.amount,
        destination: withdrawal.destination,
      });

      await this.updateWithdrawalStatus(
        withdrawal.id,
        "completed",
        result.transactionId
      );
    } catch (error) {
      if (error instanceof GatewayTimeoutError) {
        // Mark as processing and retry later
        await this.updateWithdrawalStatus(withdrawal.id, "processing");
        await this.queueRetry(withdrawal.id);
      } else if (error instanceof InsufficientFundsError) {
        await this.updateWithdrawalStatus(
          withdrawal.id,
          "failed",
          null,
          "Insufficient funds"
        );
      } else {
        await this.updateWithdrawalStatus(
          withdrawal.id,
          "failed",
          null,
          error.message
        );
      }

      // Notify user
      await notificationService.send(withdrawal.userId, {
        type: "WITHDRAWAL_FAILED",
        message: "Your withdrawal request failed. Please try again.",
      });
    }
  }
}
```

### Error Monitoring and Logging

#### Sentry Integration

```typescript
// Initialize Sentry
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
});

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: "task_submission",
      userId: user.id,
    },
    extra: {
      taskId: task.id,
      submissionData: submission,
    },
  });
}
```

#### Structured Logging

```typescript
// Winston logger configuration
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Usage
logger.error("Task submission failed", {
  userId: user.id,
  taskId: task.id,
  error: error.message,
  stack: error.stack,
});
```

## Testing Strategy

### Frontend Testing

#### Unit Testing

**Framework:** Jest + React Native Testing Library

```typescript
// Component test example
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import TaskCard from "../TaskCard";

describe("TaskCard", () => {
  const mockTask = {
    id: "1",
    title: "Follow on Instagram",
    reward: 50,
    category: "social_media",
    estimatedTime: 5,
  };

  it("renders task information correctly", () => {
    const { getByText } = render(<TaskCard task={mockTask} />);
    expect(getByText("Follow on Instagram")).toBeTruthy();
    expect(getByText("₦50")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TaskCard task={mockTask} onPress={onPress} />
    );

    fireEvent.press(getByTestId("task-card"));
    expect(onPress).toHaveBeenCalledWith("1");
  });
});

// Hook test example
import { renderHook, act } from "@testing-library/react-hooks";
import { useWallet } from "../useWallet";

describe("useWallet", () => {
  it("fetches wallet balance on mount", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWallet());

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.balance).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
```

#### Integration Testing

```typescript
// API integration test
import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer(
  rest.get("/api/v1/tasks", (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [mockTask1, mockTask2],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Task API Integration", () => {
  it("fetches and displays tasks", async () => {
    const { getByText } = render(<TaskBrowseScreen />);

    await waitFor(() => {
      expect(getByText("Follow on Instagram")).toBeTruthy();
    });
  });
});
```

#### E2E Testing

**Framework:** Detox

```typescript
// E2E test example
describe("Task Completion Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it("should complete a task successfully", async () => {
    // Login
    await element(by.id("email-input")).typeText("worker@test.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.id("login-button")).tap();

    // Browse tasks
    await waitFor(element(by.id("task-list")))
      .toBeVisible()
      .withTimeout(5000);

    // Select task
    await element(by.id("task-card-1")).tap();

    // Accept task
    await element(by.id("accept-task-button")).tap();

    // Submit proof
    await element(by.id("proof-input")).typeText("https://instagram.com/proof");
    await element(by.id("submit-button")).tap();

    // Verify success
    await expect(element(by.text("Task submitted successfully"))).toBeVisible();
  });
});
```

### Backend Testing

#### Unit Testing

**Framework:** Jest

```typescript
// Service test example
import { TaskService } from "../task.service";
import { TaskRepository } from "../task.repository";

describe("TaskService", () => {
  let taskService: TaskService;
  let taskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    taskRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    taskService = new TaskService(taskRepository);
  });

  describe("createTask", () => {
    it("should create task and deduct from sponsor wallet", async () => {
      const taskData = {
        title: "Test Task",
        reward: 100,
        totalSlots: 10,
      };

      const result = await taskService.createTask("sponsor-1", taskData);

      expect(result).toBeDefined();
      expect(taskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sponsorId: "sponsor-1",
          title: "Test Task",
        })
      );
    });

    it("should throw error if sponsor has insufficient balance", async () => {
      jest.spyOn(walletService, "getBalance").mockResolvedValue(50);

      await expect(
        taskService.createTask("sponsor-1", { reward: 100, totalSlots: 10 })
      ).rejects.toThrow("Insufficient balance");
    });
  });
});
```

#### Integration Testing

```typescript
// API endpoint test
import request from "supertest";
import { app } from "../app";

describe("Task API", () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();

    // Get auth token
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password" });

    authToken = response.body.data.token;
  });

  describe("GET /api/v1/tasks", () => {
    it("should return list of tasks", async () => {
      const response = await request(app)
        .get("/api/v1/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter tasks by category", async () => {
      const response = await request(app)
        .get("/api/v1/tasks?category=social_media")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.data.every((task) => task.category === "social_media")
      ).toBe(true);
    });
  });

  describe("POST /api/v1/tasks/:id/submit", () => {
    it("should submit task completion", async () => {
      const response = await request(app)
        .post("/api/v1/tasks/task-1/submit")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          proofs: [
            { type: "screenshot", url: "https://example.com/proof.jpg" },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("pending");
    });
  });
});
```

#### Load Testing

**Framework:** Artillery

```yaml
# load-test.yml
config:
  target: "https://api.taskapp.com"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Browse and accept task"
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "worker{{ $randomNumber() }}@test.com"
            password: "password123"
          capture:
            - json: "$.data.token"
              as: "token"

      - get:
          url: "/api/v1/tasks"
          headers:
            Authorization: "Bearer {{ token }}"

      - post:
          url: "/api/v1/tasks/{{ $randomString() }}/accept"
          headers:
            Authorization: "Bearer {{ token }}"
```

### Testing Coverage Goals

**Frontend:**

- Unit tests: 80% coverage
- Integration tests: Key user flows
- E2E tests: Critical paths (login, task completion, withdrawal)

**Backend:**

- Unit tests: 85% coverage
- Integration tests: All API endpoints
- Load tests: 1000 concurrent users

### Continuous Testing

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:integration

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx detox build --configuration ios.sim.release
      - run: npx detox test --configuration ios.sim.release
```

## Security Considerations

### Authentication & Authorization

#### JWT Token Management

```typescript
// Token structure
interface JWTPayload {
  userId: string;
  roles: UserRole[];
  sessionId: string;
  iat: number;
  exp: number;
}

// Token generation
const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
      sessionId: generateSessionId(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, sessionId: generateSessionId() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Token refresh
app.post("/api/v1/auth/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await userRepository.findById(payload.userId);

    if (!user || user.status !== "active") {
      throw new Error("Invalid user");
    }

    const tokens = generateTokens(user);
    res.json({ success: true, data: tokens });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid refresh token" });
  }
});
```

#### Role-Based Access Control

```typescript
// Middleware for role checking
const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const hasRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

// Usage
app.post(
  "/api/v1/tasks",
  authenticate,
  requireRole(UserRole.SPONSOR),
  createTask
);

app.get(
  "/api/v1/admin/users",
  authenticate,
  requireRole(UserRole.ADMIN),
  listUsers
);
```

### Data Protection

#### Encryption at Rest

```typescript
// Sensitive data encryption
import crypto from "crypto";

class EncryptionService {
  private algorithm = "aes-256-gcm";
  private key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// Store encrypted KYC data
const encryptionService = new EncryptionService();
user.kyc.nin = encryptionService.encrypt(ninNumber);
```

#### Secure Storage (Mobile)

```typescript
import * as SecureStore from "expo-secure-store";

// Store sensitive data
await SecureStore.setItemAsync("auth_token", token);
await SecureStore.setItemAsync("refresh_token", refreshToken);

// Retrieve sensitive data
const token = await SecureStore.getItemAsync("auth_token");

// Delete on logout
await SecureStore.deleteItemAsync("auth_token");
await SecureStore.deleteItemAsync("refresh_token");
```

### Input Validation & Sanitization

```typescript
import { body, param, query, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";

// Validation middleware
const validateTaskCreation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .customSanitizer((value) => sanitizeHtml(value, { allowedTags: [] })),
  body("description")
    .trim()
    .isLength({ min: 20, max: 1000 })
    .customSanitizer((value) =>
      sanitizeHtml(value, { allowedTags: ["b", "i", "u"] })
    ),
  body("reward").isFloat({ min: 10, max: 100000 }).toFloat(),
  body("totalSlots").isInt({ min: 1, max: 10000 }).toInt(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.post("/api/v1/tasks", validateTaskCreation, createTask);
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

// General API rate limit
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later",
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use("/api/", apiLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
```

### SQL Injection Prevention

```typescript
// Use parameterized queries
const getUserByEmail = async (email: string) => {
  // GOOD: Parameterized query
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  // BAD: String concatenation (vulnerable to SQL injection)
  // const result = await pool.query(
  //   `SELECT * FROM users WHERE email = '${email}'`
  // );

  return result.rows[0];
};

// Use ORM with built-in protection
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;
}

// TypeORM automatically handles parameterization
const user = await userRepository.findOne({ where: { email } });
```

### CSRF Protection

```typescript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });

// Apply to state-changing endpoints
app.post("/api/v1/tasks", csrfProtection, createTask);
app.put("/api/v1/users/profile", csrfProtection, updateProfile);

// Send CSRF token to client
app.get("/api/v1/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### Security Headers

```typescript
import helmet from "helmet";

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

## Performance Optimization

### Frontend Optimization

#### Code Splitting & Lazy Loading

```typescript
// Lazy load screens
const TaskBrowseScreen = lazy(
  () => import("./screens/worker/TaskBrowseScreen")
);
const WalletScreen = lazy(() => import("./screens/worker/WalletScreen"));

// Use Suspense
<Suspense fallback={<LoadingScreen />}>
  <TaskBrowseScreen />
</Suspense>;
```

#### Image Optimization

```typescript
// Use Expo Image with caching
import { Image } from "expo-image";

<Image
  source={{ uri: task.imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>;

// Optimize image sizes
const getOptimizedImageUrl = (url: string, width: number) => {
  return `${url}?w=${width}&q=80&fm=webp`;
};
```

#### List Virtualization

```typescript
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={tasks}
  renderItem={({ item }) => <TaskCard task={item} />}
  estimatedItemSize={120}
  keyExtractor={(item) => item.id}
/>;
```

### Backend Optimization

#### Database Indexing

```sql
-- Index frequently queried columns
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_sponsor_id ON tasks(sponsor_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_tasks_status_category ON tasks(status, category);

-- Index for full-text search
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || description));
```

#### Query Optimization

```typescript
// Use select specific columns
const tasks = await pool.query(`
  SELECT id, title, reward, category, remaining_slots
  FROM tasks
  WHERE status = 'active'
  LIMIT 20
`);

// Use joins instead of N+1 queries
const tasksWithSponsors = await pool.query(`
  SELECT 
    t.id, t.title, t.reward,
    s.id as sponsor_id, s.name as sponsor_name
  FROM tasks t
  JOIN users s ON t.sponsor_id = s.id
  WHERE t.status = 'active'
`);
```

#### Caching Strategy

```typescript
// Redis caching
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Cache task listings
app.get("/api/v1/tasks", async (req, res) => {
  const cacheKey = `tasks:${JSON.stringify(req.query)}`;

  let tasks = await cacheService.get(cacheKey);
  if (!tasks) {
    tasks = await taskService.findAll(req.query);
    await cacheService.set(cacheKey, tasks, 60); // Cache for 1 minute
  }

  res.json({ success: true, data: tasks });
});
```

## Deployment Strategy

### Environment Configuration

```typescript
// .env.example
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/taskapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=your-encryption-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=taskapp-media
PAYSTACK_SECRET_KEY=your-paystack-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-key
ADMOB_APP_ID=ca-app-pub-xxxxx
SENTRY_DSN=your-sentry-dsn
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: taskapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and push Docker image
        run: |
          docker build -t taskapp:latest .
          docker push registry.digitalocean.com/taskapp:latest

      - name: Deploy to production
        run: |
          kubectl set image deployment/taskapp taskapp=registry.digitalocean.com/taskapp:latest
          kubectl rollout status deployment/taskapp

      - name: Run database migrations
        run: npm run migrate:prod

      - name: Notify deployment
        run: curl -X POST $SLACK_WEBHOOK -d '{"text":"Deployment successful"}'
```

This comprehensive design document covers all major aspects of the task-earning mobile app architecture, from frontend components to backend services, security, testing, and deployment strategies.

## Google AdMob Integration (Priority Implementation)

### Overview

AdMob integration is a core monetization feature allowing Service Workers to earn rewards by watching video advertisements. This section details the complete implementation strategy for both frontend and backend.

### AdMob Setup

#### 1. AdMob Account Configuration

- Create AdMob account at https://admob.google.com
- Register the app (iOS and Android)
- Create Ad Units:
  - **Rewarded Video Ad Unit** (primary)
  - **Interstitial Ad Unit** (optional)
- Note App ID and Ad Unit IDs for configuration

#### 2. Expo Configuration

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-xxxxx~xxxxx",
          "iosAppId": "ca-app-pub-xxxxx~xxxxx"
        }
      ]
    ]
  }
}
```

### Frontend Implementation

#### AdMob Service

```typescript
// services/admob.ts
import {
  AdMobRewarded,
  setTestDeviceIDAsync,
  requestTrackingPermissionsAsync,
} from "expo-ads-admob";
import { Platform } from "react-native";

const REWARDED_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-xxxxx/xxxxx",
  android: "ca-app-pub-xxxxx/xxxxx",
});

class AdMobService {
  private isAdLoaded = false;
  private isAdLoading = false;

  async initialize() {
    // Request tracking permission (iOS 14+)
    if (Platform.OS === "ios") {
      await requestTrackingPermissionsAsync();
    }

    // Set test device in development
    if (__DEV__) {
      await setTestDeviceIDAsync("EMULATOR");
    }

    // Set up event listeners
    AdMobRewarded.addEventListener("rewardedVideoDidLoad", () => {
      this.isAdLoaded = true;
      this.isAdLoading = false;
    });

    AdMobRewarded.addEventListener("rewardedVideoDidFailToLoad", (error) => {
      console.error("Ad failed to load:", error);
      this.isAdLoaded = false;
      this.isAdLoading = false;
    });

    AdMobRewarded.addEventListener("rewardedVideoDidOpen", () => {
      console.log("Ad opened");
    });

    AdMobRewarded.addEventListener("rewardedVideoDidClose", () => {
      console.log("Ad closed");
      this.isAdLoaded = false;
      // Preload next ad
      this.loadAd();
    });

    AdMobRewarded.addEventListener("rewardedVideoDidRewardUser", (reward) => {
      console.log("User rewarded:", reward);
    });

    // Preload first ad
    await this.loadAd();
  }

  async loadAd(): Promise<void> {
    if (this.isAdLoading || this.isAdLoaded) {
      return;
    }

    this.isAdLoading = true;
    try {
      await AdMobRewarded.setAdUnitID(REWARDED_AD_UNIT_ID);
      await AdMobRewarded.requestAdAsync();
    } catch (error) {
      console.error("Error loading ad:", error);
      this.isAdLoading = false;
    }
  }

  async showAd(): Promise<boolean> {
    if (!this.isAdLoaded) {
      await this.loadAd();
      // Wait for ad to load (with timeout)
      const timeout = 10000; // 10 seconds
      const startTime = Date.now();
      while (!this.isAdLoaded && Date.now() - startTime < timeout) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (this.isAdLoaded) {
      try {
        await AdMobRewarded.showAdAsync();
        return true;
      } catch (error) {
        console.error("Error showing ad:", error);
        return false;
      }
    }

    return false;
  }

  isReady(): boolean {
    return this.isAdLoaded;
  }

  cleanup() {
    AdMobRewarded.removeAllListeners();
  }
}

export const adMobService = new AdMobService();
```

#### Ad Watching Component

```typescript
// components/AdWatchingTask.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { adMobService } from "../services/admob";
import { useWatchAdMutation } from "../store/api/adApi";

interface AdWatchingTaskProps {
  taskId: string;
  reward: number;
  onComplete: () => void;
}

export const AdWatchingTask: React.FC<AdWatchingTaskProps> = ({
  taskId,
  reward,
  onComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [watchAd, { isLoading: isSubmitting }] = useWatchAdMutation();

  useEffect(() => {
    checkAdStatus();
    const interval = setInterval(checkAdStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkAdStatus = () => {
    setIsAdReady(adMobService.isReady());
  };

  const handleWatchAd = async () => {
    setIsLoading(true);

    try {
      // Show the ad
      const adShown = await adMobService.showAd();

      if (adShown) {
        // Submit to backend for reward
        const result = await watchAd({
          taskId,
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        }).unwrap();

        if (result.success) {
          Alert.alert(
            "Reward Earned!",
            `You earned ₦${reward}. It has been added to your wallet.`,
            [{ text: "OK", onPress: onComplete }]
          );
        }
      } else {
        Alert.alert("Error", "Failed to load advertisement. Please try again.");
      }
    } catch (error) {
      console.error("Error watching ad:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watch Ad to Earn</Text>
      <Text style={styles.reward}>Reward: ₦{reward}</Text>

      {!isAdReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Loading advertisement...</Text>
        </View>
      )}

      <Button
        title={isLoading ? "Loading..." : "Watch Ad"}
        onPress={handleWatchAd}
        disabled={!isAdReady || isLoading || isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reward: {
    fontSize: 18,
    color: "#00A86B",
    marginBottom: 20,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
});
```

### Backend Implementation

#### AdMob Reward Model

```typescript
// models/AdMobReward.ts
import mongoose, { Schema, Document } from "mongoose";

interface IAdMobReward extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  reward: number;
  platform: "ios" | "android";
  deviceId: string;
  ipAddress: string;
  timestamp: Date;
  verified: boolean;
  transactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const adMobRewardSchema = new Schema<IAdMobReward>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    reward: { type: Number, required: true },
    platform: { type: String, enum: ["ios", "android"], required: true },
    deviceId: { type: String, required: true },
    ipAddress: { type: String, required: true },
    timestamp: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  },
  { timestamps: true }
);

// Indexes
adMobRewardSchema.index({ userId: 1, createdAt: -1 });
adMobRewardSchema.index({ deviceId: 1, createdAt: -1 });
adMobRewardSchema.index({ ipAddress: 1, createdAt: -1 });

export const AdMobReward = mongoose.model<IAdMobReward>(
  "AdMobReward",
  adMobRewardSchema
);
```

#### AdMob Service

```typescript
// services/admob.service.ts
import { AdMobReward } from "../models/AdMobReward";
import { WalletService } from "./wallet.service";
import { User } from "../models/User";

export class AdMobService {
  private walletService: WalletService;
  private readonly MAX_ADS_PER_DAY = 20;
  private readonly FRAUD_CHECK_WINDOW = 60 * 1000; // 1 minute

  constructor() {
    this.walletService = new WalletService();
  }

  async processAdReward(data: {
    userId: string;
    taskId: string;
    reward: number;
    platform: "ios" | "android";
    deviceId: string;
    ipAddress: string;
    timestamp: string;
  }) {
    // Fraud detection checks
    await this.performFraudChecks(data.userId, data.deviceId, data.ipAddress);

    // Check daily limit
    const todayCount = await this.getTodayAdCount(data.userId);
    if (todayCount >= this.MAX_ADS_PER_DAY) {
      throw new Error("Daily ad limit reached");
    }

    // Verify user exists and is active
    const user = await User.findById(data.userId);
    if (!user || user.status !== "active") {
      throw new Error("Invalid user");
    }

    // Create reward record
    const adReward = await AdMobReward.create({
      userId: data.userId,
      taskId: data.taskId,
      reward: data.reward,
      platform: data.platform,
      deviceId: data.deviceId,
      ipAddress: data.ipAddress,
      timestamp: new Date(data.timestamp),
      verified: true,
    });

    // Credit wallet
    const transaction = await this.walletService.creditWallet({
      userId: data.userId,
      amount: data.reward,
      type: "ad_reward",
      description: "Reward for watching advertisement",
      referenceId: adReward._id.toString(),
      referenceType: "admob_reward",
    });

    // Update reward with transaction ID
    adReward.transactionId = transaction._id;
    await adReward.save();

    return {
      success: true,
      reward: data.reward,
      newBalance: transaction.balanceAfter,
      transactionId: transaction._id,
    };
  }

  private async performFraudChecks(
    userId: string,
    deviceId: string,
    ipAddress: string
  ): Promise<void> {
    const now = new Date();
    const checkWindow = new Date(now.getTime() - this.FRAUD_CHECK_WINDOW);

    // Check for rapid successive ad watches (< 1 minute apart)
    const recentAds = await AdMobReward.countDocuments({
      userId,
      createdAt: { $gte: checkWindow },
    });

    if (recentAds > 0) {
      throw new Error("Please wait before watching another ad");
    }

    // Check for multiple users from same device
    const deviceUsers = await AdMobReward.distinct("userId", {
      deviceId,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    });

    if (deviceUsers.length > 3) {
      throw new Error("Suspicious activity detected");
    }

    // Check for multiple devices from same IP
    const ipDevices = await AdMobReward.distinct("deviceId", {
      ipAddress,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    });

    if (ipDevices.length > 5) {
      throw new Error("Suspicious activity detected");
    }
  }

  private async getTodayAdCount(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return await AdMobReward.countDocuments({
      userId,
      createdAt: { $gte: startOfDay },
    });
  }

  async getAdStats(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await AdMobReward.countDocuments({
      userId,
      createdAt: { $gte: startOfDay },
    });

    const todayEarnings = await AdMobReward.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$reward" },
        },
      },
    ]);

    const totalEarnings = await AdMobReward.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$reward" },
        },
      },
    ]);

    return {
      todayCount,
      remainingToday: this.MAX_ADS_PER_DAY - todayCount,
      todayEarnings: todayEarnings[0]?.total || 0,
      totalEarnings: totalEarnings[0]?.total || 0,
    };
  }
}
```

#### API Routes

```typescript
// routes/admob.routes.ts
import express from "express";
import { AdMobService } from "../services/admob.service";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roles";

const router = express.Router();
const adMobService = new AdMobService();

// Watch ad and claim reward
router.post(
  "/watch",
  authenticate,
  requireRole("service_worker"),
  async (req, res) => {
    try {
      const { taskId, timestamp, platform } = req.body;

      const result = await adMobService.processAdReward({
        userId: req.user.id,
        taskId,
        reward: 10, // Base reward, can be dynamic
        platform,
        deviceId: req.headers["x-device-id"] as string,
        ipAddress: req.ip,
        timestamp,
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// Get ad watching stats
router.get(
  "/stats",
  authenticate,
  requireRole("service_worker"),
  async (req, res) => {
    try {
      const stats = await adMobService.getAdStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;
```

### Testing AdMob Integration

#### Test Mode Configuration

```typescript
// For development, use test ad units
const TEST_AD_UNITS = {
  ios: "ca-app-pub-3940256099942544/1712485313",
  android: "ca-app-pub-3940256099942544/5224354917",
};

// Use test units in development
const AD_UNIT_ID = __DEV__
  ? TEST_AD_UNITS[Platform.OS]
  : PRODUCTION_AD_UNITS[Platform.OS];
```

#### Manual Testing Checklist

- [ ] Ad loads successfully on iOS
- [ ] Ad loads successfully on Android
- [ ] Ad plays to completion
- [ ] Reward is credited to wallet
- [ ] Daily limit is enforced (20 ads)
- [ ] Fraud detection prevents rapid successive watches
- [ ] Ad stats display correctly
- [ ] Error handling works for failed ad loads
- [ ] Offline behavior is graceful

### AdMob Analytics Dashboard

```typescript
// Admin analytics for AdMob performance
router.get(
  "/admin/admob/analytics",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    const { startDate, endDate } = req.query;

    const analytics = await AdMobReward.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            platform: "$platform",
          },
          totalAds: { $sum: 1 },
          totalRewards: { $sum: "$reward" },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          date: "$_id.date",
          platform: "$_id.platform",
          totalAds: 1,
          totalRewards: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.json({ success: true, data: analytics });
  }
);
```

### Revenue Optimization

#### Dynamic Reward Amounts

```typescript
// Adjust rewards based on time of day, user level, etc.
const calculateAdReward = (user: IUser): number => {
  let baseReward = 10;

  // Bonus for higher level users
  if (user.reputation.level >= 5) {
    baseReward += 2;
  }

  // Peak hours bonus (6 PM - 10 PM)
  const hour = new Date().getHours();
  if (hour >= 18 && hour <= 22) {
    baseReward += 3;
  }

  return baseReward;
};
```

#### Ad Frequency Optimization

```typescript
// Suggest optimal times for ad watching
const getOptimalAdTimes = async (userId: string) => {
  const history = await AdMobReward.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  // Analyze patterns and suggest best times
  // Implementation depends on ML/analytics requirements
};
```

This comprehensive AdMob integration provides a complete, production-ready implementation with fraud prevention, analytics, and optimization features.

## OTP-Based Authentication (Mobile-First)

### Overview

Since this is a mobile application, we use OTP (One-Time Password) verification instead of email links for a seamless mobile experience. OTPs are sent via SMS or email and verified within the app.

### OTP Model

```typescript
// models/OTP.ts
import mongoose, { Schema, Document } from "mongoose";

interface IOTP extends Document {
  identifier: string; // phone number or email
  type: "phone" | "email";
  code: string;
  purpose: "registration" | "login" | "password_reset" | "phone_verification";
  attempts: number;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    identifier: { type: String, required: true },
    type: { type: String, enum: ["phone", "email"], required: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["registration", "login", "password_reset", "phone_verification"],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Index for quick lookups and auto-deletion
otpSchema.index({ identifier: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
```

### OTP Service

```typescript
// services/otp.service.ts
import crypto from "crypto";
import { OTP } from "../models/OTP";
import { SMSService } from "./sms.service";
import { EmailService } from "./email.service";

export class OTPService {
  private smsService: SMSService;
  private emailService: EmailService;
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  constructor() {
    this.smsService = new SMSService();
    this.emailService = new EmailService();
  }

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(data: {
    identifier: string;
    type: "phone" | "email";
    purpose: "registration" | "login" | "password_reset" | "phone_verification";
  }): Promise<{ success: boolean; expiresIn: number }> {
    // Invalidate any existing OTPs for this identifier and purpose
    await OTP.updateMany(
      {
        identifier: data.identifier,
        purpose: data.purpose,
        verified: false,
      },
      { verified: true } // Mark as used
    );

    // Generate new OTP
    const code = this.generateOTP();
    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // Save to database
    await OTP.create({
      identifier: data.identifier,
      type: data.type,
      code,
      purpose: data.purpose,
      expiresAt,
    });

    // Send OTP
    if (data.type === "phone") {
      await this.smsService.sendSMS({
        to: data.identifier,
        message: `Your verification code is: ${code}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`,
      });
    } else {
      await this.emailService.sendEmail({
        to: data.identifier,
        subject: "Your Verification Code",
        html: `
          <h2>Verification Code</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      });
    }

    return {
      success: true,
      expiresIn: this.OTP_EXPIRY_MINUTES * 60, // seconds
    };
  }

  async verifyOTP(data: {
    identifier: string;
    code: string;
    purpose: "registration" | "login" | "password_reset" | "phone_verification";
  }): Promise<{ success: boolean; error?: string }> {
    // Find the OTP
    const otp = await OTP.findOne({
      identifier: data.identifier,
      purpose: data.purpose,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otp) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    // Check if expired
    if (new Date() > otp.expiresAt) {
      return { success: false, error: "OTP has expired" };
    }

    // Check attempts
    if (otp.attempts >= this.MAX_ATTEMPTS) {
      return {
        success: false,
        error: "Maximum attempts exceeded. Please request a new OTP.",
      };
    }

    // Verify code
    if (otp.code !== data.code) {
      otp.attempts += 1;
      await otp.save();
      return {
        success: false,
        error: `Invalid OTP. ${
          this.MAX_ATTEMPTS - otp.attempts
        } attempts remaining.`,
      };
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    return { success: true };
  }

  async resendOTP(data: {
    identifier: string;
    type: "phone" | "email";
    purpose: "registration" | "login" | "password_reset" | "phone_verification";
  }): Promise<{ success: boolean; expiresIn: number }> {
    // Check rate limiting (prevent spam)
    const recentOTP = await OTP.findOne({
      identifier: data.identifier,
      purpose: data.purpose,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }, // Last 1 minute
    });

    if (recentOTP) {
      throw new Error("Please wait before requesting a new OTP");
    }

    return this.sendOTP(data);
  }
}
```

### SMS Service (Twilio)

```typescript
// services/sms.service.ts
import twilio from "twilio";

export class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(data: { to: string; message: string }): Promise<void> {
    try {
      await this.client.messages.create({
        body: data.message,
        from: this.fromNumber,
        to: data.to,
      });
    } catch (error) {
      console.error("SMS sending failed:", error);
      throw new Error("Failed to send SMS");
    }
  }
}
```

### Authentication API Routes with OTP

```typescript
// routes/auth.routes.ts
import express from "express";
import { AuthService } from "../services/auth.service";
import { OTPService } from "../services/otp.service";

const router = express.Router();
const authService = new AuthService();
const otpService = new OTPService();

// Register - Step 1: Send OTP
router.post("/register/send-otp", async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    // Send OTP to phone
    const result = await otpService.sendOTP({
      identifier: phoneNumber,
      type: "phone",
      purpose: "registration",
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Register - Step 2: Verify OTP and create account
router.post("/register/verify", async (req, res) => {
  try {
    const { phoneNumber, email, password, firstName, lastName, otp } = req.body;

    // Verify OTP
    const otpResult = await otpService.verifyOTP({
      identifier: phoneNumber,
      code: otp,
      purpose: "registration",
    });

    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // Create user
    const user = await authService.register({
      phoneNumber,
      email,
      password,
      firstName,
      lastName,
    });

    // Generate tokens
    const tokens = authService.generateTokens(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profile: user.profile,
        },
        ...tokens,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Login with password
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be phone or email

    const result = await authService.login(identifier, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

// Forgot password - Step 1: Send OTP
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { identifier } = req.body; // phone or email

    // Check if user exists
    const user = await User.findOne({
      $or: [{ phoneNumber: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Send OTP
    const result = await otpService.sendOTP({
      identifier: user.phoneNumber,
      type: "phone",
      purpose: "password_reset",
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Forgot password - Step 2: Verify OTP and reset password
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [{ phoneNumber: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify OTP
    const otpResult = await otpService.verifyOTP({
      identifier: user.phoneNumber,
      code: otp,
      purpose: "password_reset",
    });

    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // Reset password
    await authService.resetPassword(user._id, newPassword);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const { identifier, type, purpose } = req.body;

    const result = await otpService.resendOTP({
      identifier,
      type,
      purpose,
    });

    res.json(result);
  } catch (error) {
    res.status(429).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

### Frontend OTP Implementation with React Query

#### OTP Hooks

```typescript
// api/mutations/authMutations.ts
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../client";

export const useSendOTP = () => {
  return useMutation({
    mutationFn: async (data: { phoneNumber: string; email: string }) => {
      const response = await apiClient.post("/auth/register/send-otp", data);
      return response.data;
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data: {
      phoneNumber: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      otp: string;
    }) => {
      const response = await apiClient.post("/auth/register/verify", data);
      return response.data;
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: async (data: {
      identifier: string;
      type: "phone" | "email";
      purpose: string;
    }) => {
      const response = await apiClient.post("/auth/resend-otp", data);
      return response.data;
    },
  });
};
```

#### OTP Verification Screen

```typescript
// screens/auth/OTPVerificationScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useVerifyOTP, useResendOTP } from "../../api/mutations/authMutations";
import { useAuthStore } from "../../store/authStore";

export const OTPVerificationScreen = ({ route, navigation }) => {
  const { phoneNumber, email, password, firstName, lastName } = route.params;
  const [otp, setOTP] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const verifyOTP = useVerifyOTP();
  const resendOTP = useResendOTP();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    try {
      const result = await verifyOTP.mutateAsync({
        phoneNumber,
        email,
        password,
        firstName,
        lastName,
        otp,
      });

      if (result.success) {
        setAuth(result.data);
        navigation.replace("Home");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Verification failed"
      );
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP.mutateAsync({
        identifier: phoneNumber,
        type: "phone",
        purpose: "registration",
      });

      setTimer(60);
      setCanResend(false);
      Alert.alert("Success", "OTP resent successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to resend OTP"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>We sent a code to {phoneNumber}</Text>

      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={setOTP}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
      />

      <Button
        title={verifyOTP.isPending ? "Verifying..." : "Verify"}
        onPress={handleVerify}
        disabled={otp.length !== 6 || verifyOTP.isPending}
      />

      <View style={styles.resendContainer}>
        {canResend ? (
          <Button
            title="Resend OTP"
            onPress={handleResend}
            disabled={resendOTP.isPending}
          />
        ) : (
          <Text>Resend in {timer}s</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 20,
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
```

### React Query Configuration

```typescript
// App.tsx or providers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

This OTP-based authentication system is optimized for mobile apps with SMS/email verification, proper rate limiting, and a smooth user experience using React Query for state management.
