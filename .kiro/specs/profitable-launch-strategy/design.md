# Design Document: Profitable Launch Strategy

## Introduction

This design document outlines the technical architecture and implementation approach for transforming Earn9ja into a profitable platform. The design ensures every revenue stream generates more income than expenses, implements proper financial monitoring, and establishes a phased launch strategy to scale sustainably.

## Current Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Payments**: Paystack & Flutterwave
- **Push Notifications**: Firebase Cloud Messaging
- **Monitoring**: Sentry

## Glossary

- **Earn9ja Platform**: The mobile task-earning application system
- **AdMob Service**: Google's mobile advertising platform integration
- **Escrow System**: Financial holding mechanism for sponsor funds
- **Financial Monitor**: Real-time profit/loss tracking system
- **Launch Controller**: Phased user onboarding management system
- **Sponsor Package**: Tiered service offerings for business clients

## System Architecture

### Revenue Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AdMob SDK     │    │   Sponsor       │    │   Platform      │
│                 │    │   Deposits      │    │   Revenue       │
│ ₦0.80 per ad    │───▶│                 │───▶│                 │
│                 │    │ Escrow Account  │    │ Commission Pool │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Worker        │    │   Task          │    │   Bonus         │
│   Payments      │    │   Payments      │    │   Payments      │
│                 │    │                 │    │                 │
│ ₦0.60-₦0.55/ad  │    │ 80-85% of task  │    │ From ad profits │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Financial Control System

```
┌─────────────────────────────────────────────────────────────┐
│                    Financial Monitor                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Ad Revenue  │  │Task Revenue │  │   Expenses  │        │
│  │   Tracker   │  │   Tracker   │  │   Tracker   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           ▼                                │
│                  ┌─────────────────┐                       │
│                  │ Profit/Loss     │                       │
│                  │ Calculator      │                       │
│                  └─────────────────┘                       │
│                           │                                │
│                           ▼                                │
│                  ┌─────────────────┐                       │
│                  │ Alert System    │                       │
│                  │ (if loss > ₦5K) │                       │
│                  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Profitable Ad Reward Component

**Current Problem**: Your existing rewards (₦1.50, ₦1.25, ₦1.00) are TOO HIGH. With AdMob eCPM of ~₦0.80 in Nigeria, you're losing ₦0.70-₦1.20 per ad!

**Location:** `Earn9ja/services/admob/config.ts`

**Changes Needed**:

```typescript
export const AdMobConfig = {
  // ... keep existing test/production IDs ...

  maxAdsPerDay: 50,

  // NEW: Expected AdMob revenue per ad view in Nigeria
  expectedAdMobRevenue: 0.8,

  // UPDATED: Profitable tiered reward system
  rewardTiers: [
    { min: 1, max: 20, amount: 0.6 }, // ₦0.60 (₦0.20 profit per ad)
    { min: 21, max: 50, amount: 0.55 }, // ₦0.55 (₦0.25 profit per ad)
  ],

  // Helper to get reward amount based on ad count
  getRewardAmount(adCount: number): number {
    const adNumber = adCount + 1;
    for (const tier of this.rewardTiers) {
      if (adNumber >= tier.min && adNumber <= tier.max) {
        return tier.amount;
      }
    }
    return this.rewardTiers[this.rewardTiers.length - 1].amount;
  },

  // ... keep existing ad settings ...
};
```

### 2. Sponsor Escrow Management

**Location:** `backend/src/services/EscrowService.ts`

````typescript
class EscrowService {
  async depositSponsorFunds(sponsorId: string, amount: number): Promise<EscrowAccount> {
    // 1. Validate sponsor payment
    // 2. Create escrow account
    // 3. Hold funds until task completion
    // 4. Track available balance for task creation
  }

  async releaseTaskPayment(taskId: string): Promise<void> {
    // 1. Verify task completion
    // 2. Calculate commission (15-20%)
    // 3. Pay worker (80-85%)
    // 4. Transfer commission to platform
  }
}
`
``

### 3. Financial Monitoring Dashboard

**Location:** `Earn9ja/app/(admin)/financial-monitor.tsx`

```typescript
interface FinancialMetrics {
  dailyAdRevenue: number;
  dailyAdExpenses: number;
  dailyTaskRevenue: number;
  dailyBonusExpenses: number;
  netDailyProfit: number;
  profitMarginPercentage: number;
}

const FinancialMonitor = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>();
  const [alerts, setAlerts] = useState<Alert[]>();

  // Real-time profit/loss monitoring
  // Alert system for losses > ₦5,000
  // Weekly/monthly trend analysis
};
````

### 4. Phased Launch Controller

**Location:** `backend/src/services/LaunchController.ts`

```typescript
class LaunchController {
  async validatePhase1Requirements(): Promise<boolean> {
    const sponsors = await this.getSponsorCount();
    const escrowBalance = await this.getEscrowBalance();
    const tasksReady = await this.getReadyTasksCount();

    return sponsors >= 5 && escrowBalance >= 100000 && tasksReady >= 20;
  }

  async validatePhase2Requirements(): Promise<boolean> {
    const profitDays = await this.getConsecutiveProfitDays();
    return profitDays >= 7;
  }
}
```

## Database Schema Changes (Mongoose Models)

### 1. Escrow Account Model

**Location:** `backend/src/models/EscrowAccount.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IEscrowAccount extends Document {
  sponsorId: mongoose.Types.ObjectId;
  balance: number;
  reservedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: "active" | "frozen" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const escrowAccountSchema = new Schema<IEscrowAccount>(
  {
    sponsorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeposited: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const EscrowAccount = mongoose.model<IEscrowAccount>(
  "EscrowAccount",
  escrowAccountSchema
);
```

### 2. Financial Transaction Model

**Location:** `backend/src/models/FinancialTransaction.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IFinancialTransaction extends Document {
  type:
    | "ad_revenue"
    | "ad_expense"
    | "task_commission"
    | "task_payment"
    | "bonus_payment"
    | "escrow_deposit"
    | "escrow_release";
  amount: number;
  userId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  escrowAccountId?: mongoose.Types.ObjectId;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const financialTransactionSchema = new Schema<IFinancialTransaction>(
  {
    type: {
      type: String,
      enum: [
        "ad_revenue",
        "ad_expense",
        "task_commission",
        "task_payment",
        "bonus_payment",
        "escrow_deposit",
        "escrow_release",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    escrowAccountId: {
      type: Schema.Types.ObjectId,
      ref: "EscrowAccount",
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
financialTransactionSchema.index({ type: 1, createdAt: -1 });
financialTransactionSchema.index({ userId: 1, createdAt: -1 });

export const FinancialTransaction = mongoose.model<IFinancialTransaction>(
  "FinancialTransaction",
  financialTransactionSchema
);
```

### 3. Daily Financial Summary Model

**Location:** `backend/src/models/DailyFinancialSummary.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IDailyFinancialSummary extends Document {
  date: Date;
  adRevenue: number;
  adExpenses: number;
  taskRevenue: number;
  taskExpenses: number;
  bonusExpenses: number;
  escrowDeposits: number;
  netProfit: number;
  profitMargin: number;
  metrics: {
    totalAdsWatched: number;
    totalTasksCompleted: number;
    totalBonusesPaid: number;
    activeUsers: number;
    newUsers: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const dailyFinancialSummarySchema = new Schema<IDailyFinancialSummary>(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    adRevenue: {
      type: Number,
      default: 0,
    },
    adExpenses: {
      type: Number,
      default: 0,
    },
    taskRevenue: {
      type: Number,
      default: 0,
    },
    taskExpenses: {
      type: Number,
      default: 0,
    },
    bonusExpenses: {
      type: Number,
      default: 0,
    },
    escrowDeposits: {
      type: Number,
      default: 0,
    },
    netProfit: {
      type: Number,
      default: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
    metrics: {
      totalAdsWatched: { type: Number, default: 0 },
      totalTasksCompleted: { type: Number, default: 0 },
      totalBonusesPaid: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-based queries
dailyFinancialSummarySchema.index({ date: -1 });

export const DailyFinancialSummary = mongoose.model<IDailyFinancialSummary>(
  "DailyFinancialSummary",
  dailyFinancialSummarySchema
);
```

### 4. Launch Phase Model

**Location:** `backend/src/models/LaunchPhase.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ILaunchPhase extends Document {
  currentPhase: 1 | 2 | 3;
  phase1: {
    sponsorCount: number;
    escrowBalance: number;
    tasksReady: number;
    userCount: number;
    completed: boolean;
    completedAt?: Date;
  };
  phase2: {
    consecutiveProfitDays: number;
    userCount: number;
    completed: boolean;
    completedAt?: Date;
  };
  phase3: {
    launched: boolean;
    launchedAt?: Date;
  };
  updatedAt: Date;
}

const launchPhaseSchema = new Schema<ILaunchPhase>(
  {
    currentPhase: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    phase1: {
      sponsorCount: { type: Number, default: 0 },
      escrowBalance: { type: Number, default: 0 },
      tasksReady: { type: Number, default: 0 },
      userCount: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      completedAt: Date,
    },
    phase2: {
      consecutiveProfitDays: { type: Number, default: 0 },
      userCount: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      completedAt: Date,
    },
    phase3: {
      launched: { type: Boolean, default: false },
      launchedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const LaunchPhase = mongoose.model<ILaunchPhase>(
  "LaunchPhase",
  launchPhaseSchema
);
```

## API Endpoints

### 1. Financial Monitoring APIs

```typescript
// GET /api/admin/financial-summary
interface FinancialSummaryResponse {
  today: FinancialMetrics;
  week: FinancialMetrics;
  month: FinancialMetrics;
  alerts: Alert[];
}

// GET /api/admin/profit-loss?period=daily|weekly|monthly
interface ProfitLossResponse {
  period: string;
  data: Array<{
    date: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}
```

### 2. Sponsor Escrow APIs

```typescript
// POST /api/sponsors/deposit
interface DepositRequest {
  amount: number;
  paymentMethod: "paystack" | "flutterwave";
  paymentReference: string;
}

// GET /api/sponsors/escrow-balance
interface EscrowBalanceResponse {
  availableBalance: number;
  reservedBalance: number;
  totalDeposited: number;
}
```

### 3. Launch Phase APIs

```typescript
// GET /api/admin/launch-status
interface LaunchStatusResponse {
  currentPhase: 1 | 2 | 3;
  phase1Requirements: {
    sponsors: { current: number; required: 5; met: boolean };
    escrow: { current: number; required: 100000; met: boolean };
    tasks: { current: number; required: 20; met: boolean };
  };
  phase2Requirements: {
    profitDays: { current: number; required: 7; met: boolean };
  };
}
```

## User Interface Design

### 1. Admin Financial Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                 Financial Monitor Dashboard                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Today's Summary                    🚨 Alerts           │
│  ┌─────────────────┐                  ┌─────────────────┐  │
│  │ Revenue: ₦12,600│                  │ No alerts today │  │
│  │ Expenses: ₦8,400│                  │                 │  │
│  │ Profit: ₦4,200  │                  │                 │  │
│  │ Margin: 33.3%   │                  │                 │  │
│  └─────────────────┘                  └─────────────────┘  │
│                                                             │
│  📈 Revenue Breakdown              📉 Expense Breakdown     │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ Ad Revenue: 60% │              │ Ad Rewards: 70% │      │
│  │ Task Comm.: 40% │              │ Bonuses: 20%    │      │
│  │                 │              │ Operations: 10% │      │
│  └─────────────────┘              └─────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Sponsor Escrow Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│                    Sponsor Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💰 Escrow Balance                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Available: ₦45,000                                      ││
│  │ Reserved: ₦15,000 (for 75 pending tasks)               ││
│  │ Total Deposited: ₦100,000                               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  📊 Task Performance                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Completed Today: 25 tasks                               ││
│  │ Success Rate: 95%                                       ││
│  │ Average Completion Time: 2.3 hours                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [Deposit Funds] [Create Task] [View Analytics]            │
└─────────────────────────────────────────────────────────────┘
```

### 3. Launch Phase Status

```
┌─────────────────────────────────────────────────────────────┐
│                   Launch Phase Status                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🚀 Current Phase: Phase 1 (Soft Launch)                   │
│                                                             │
│  ✅ Phase 1 Requirements:                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ✅ Sponsors: 5/5                                        ││
│  │ ✅ Escrow: ₦100,000/₦100,000                            ││
│  │ ✅ Tasks Ready: 25/20                                   ││
│  │ ✅ Users: 100/100                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ⏳ Phase 2 Requirements:                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔄 Profitable Days: 3/7                                ││
│  │ 📊 Current Daily Profit: ₦2,100                        ││
│  │ 📈 Trend: Positive                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [View Detailed Metrics] [Export Report]                   │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### 1. Escrow Fund Protection

- Separate escrow accounts for each sponsor
- Multi-signature requirements for large withdrawals
- Daily reconciliation of escrow balances
- Audit trail for all fund movements

### 2. Financial Data Security

- Encrypted storage of financial transactions
- Role-based access to financial dashboards
- Regular backup of financial data
- Compliance with financial regulations

### 3. Fraud Prevention

- Real-time monitoring of unusual patterns
- Automated alerts for suspicious activities
- Rate limiting on bonus claims
- Device fingerprinting for ad watching

## Performance Considerations

### 1. Real-time Financial Monitoring

- Use Redis for caching financial metrics
- WebSocket connections for live updates
- Batch processing for daily summaries
- Optimized database queries with indexes

### 2. Scalable Escrow Management

- Horizontal scaling of escrow services
- Load balancing for payment processing
- Asynchronous task processing
- Database sharding for large transaction volumes

## Testing Strategy

### 1. Financial Accuracy Testing

- Unit tests for profit/loss calculations
- Integration tests for escrow flows
- End-to-end tests for complete payment cycles
- Load testing for high transaction volumes

### 2. Launch Phase Validation

- Automated tests for phase requirements
- Simulation of different user scenarios
- Performance testing at each scale level
- Rollback procedures for failed launches

## Monitoring and Alerting

### 1. Financial Health Monitoring

- Real-time profit/loss tracking
- Daily financial summary reports
- Weekly trend analysis
- Monthly business intelligence reports

### 2. Alert System

- Immediate alerts for daily losses > ₦5,000
- Warning alerts for declining profit margins
- Notification for low escrow balances
- Success alerts for phase completion milestones

## Implementation Phases

### Phase 1: Foundation (Week 1)

- Update ad reward configuration
- Implement profit margin validation
- Reduce daily bonus amounts
- Disable spin wheel feature

### Phase 2: Escrow System (Week 2)

- Create escrow service
- Integrate sponsor deposits
- Implement task payment release

### Phase 3: Monitoring & Control (Week 3)

- Build financial monitoring dashboard
- Implement alert system
- Create launch phase controller

### Phase 4: Testing & Deployment (Week 4)

- Comprehensive testing
- Production deployment
- Monitoring setup
