# Implementation Tasks: Profitable Launch Strategy

## Overview

This implementation plan transforms Earn9ja into a profitable platform by fixing the ad reward economics, implementing sponsor escrow, building financial monitoring, and establishing a phased launch strategy.

**Critical Issue**: Current ad rewards (₦1.50-₦1.00) lose money on every ad. With AdMob eCPM of ₦0.80, you're losing ₦0.20-₦0.70 per ad watched!

## Task List

- [x] 1. Fix Ad Reward Economics (CRITICAL - Stop the bleeding!)

  - Update `Earn9ja/services/admob/config.ts` to profitable reward tiers
  - Change rewards from ₦1.50/₦1.25/₦1.00 to ₦0.60/₦0.55
  - Update `backend/src/services/AdMobService.ts` to use new tiers
  - Test reward calculations
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create Sponsor Escrow System

  - Create Mongoose models for escrow accounts and transactions
  - Build `EscrowService.ts` for deposit/reserve/release operations
  - Integrate Paystack/Flutterwave deposit flow
  - Implement automatic payment release on task completion
  - Build sponsor escrow dashboard UI
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Build Financial Monitoring System

  - Create `DailyFinancialSummary` Mongoose model
  - Build `FinancialSummaryService.ts` for calculations
  - Create admin financial monitoring dashboard
  - Implement alert system for losses > ₦5,000
  - Add real-time profit/loss tracking
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Reduce Bonus System Expenses

  - Reduce daily bonus from ₦10 to ₦5
  - Disable spin wheel feature (add feature flag)
  - Make referral bonuses conditional (5 completed tasks)
  - Fund bonuses only from ad profits
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Implement Phased Launch Controller

  - Create `LaunchPhase` Mongoose model
  - Build `LaunchController.ts` service
  - Implement Phase 1 validation (5 sponsors, ₦100K escrow)
  - Implement Phase 2 validation (7 profitable days)
  - Add user registration limits per phase
  - Build launch status dashboard
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6. Create Sponsor Acquisition Tools

  - Define sponsor package tiers (Bronze/Silver/Gold)
  - Build sponsor onboarding flow
  - Create sponsor analytics dashboard
  - _Requirements: 6.1, 6.2_

- [ ]\* 7. Testing

  - Unit tests for financial calculations
  - Integration tests for escrow flows
  - End-to-end payment cycle tests
  - _Requirements: All_

- [x] 8. Production Deployment

  - Run database migrations
  - Deploy backend updates
  - Deploy mobile app updates
  - Configure monitoring
  - _Requirements: All_

## Detailed Task Breakdown

### Task 1: Fix Ad Reward Economics (CRITICAL)

- [x] 1.1 Update AdMob reward configuration

  - **File**: `Earn9ja/services/admob/config.ts`
  - Change `rewardTiers` from current values to:
    - Tier 1 (ads 1-20): ₦0.60 each
    - Tier 2 (ads 21-50): ₦0.55 each
  - Add `expectedAdMobRevenue: 0.80`
  - Keep existing `getRewardAmount()` helper function
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Update backend AdMob service

  - **File**: `backend/src/services/AdMobService.ts`
  - Update reward calculation to use new tiers
  - Add profit margin validation
  - Log all reward transactions to `FinancialTransaction` model
  - _Requirements: 1.2, 1.3_

- [x] 1.3 Update AdMob reward API endpoint

  - **File**: `backend/src/controllers/admob.controller.ts`
  - Ensure reward endpoint uses new tier calculation
  - Add validation to prevent negative profit margins
  - _Requirements: 1.3_

### Task 2: Create Sponsor Escrow System

- [x] 2.1 Create Mongoose models

  - **Create**: `backend/src/models/EscrowAccount.ts`
    - Fields: sponsorId, balance, reservedBalance, totalDeposited, status
  - **Create**: `backend/src/models/FinancialTransaction.ts`
    - Fields: type, amount, userId, taskId, escrowAccountId, description
  - Add indexes for performance
  - _Requirements: 2.1_

- [x] 2.2 Build escrow service

  - **Create**: `backend/src/services/EscrowService.ts`
  - Implement `depositFunds(sponsorId, amount, paymentRef)`
  - Implement `reserveFunds(sponsorId, amount, taskId)`
  - Implement `releaseFunds(taskId)` - pays worker, takes commission
  - Implement `refundFunds(taskId)` - for cancelled tasks
  - Log all operations to `FinancialTransaction`
  - _Requirements: 2.1, 2.2_

- [x] 2.3 Integrate sponsor deposit flow

  - **Create**: `backend/src/routes/escrow.routes.ts`
  - **Create**: `backend/src/controllers/escrow.controller.ts`
  - POST `/api/sponsors/deposit` - initiate Paystack/Flutterwave payment
  - POST `/api/webhooks/payment` - handle payment confirmation
  - GET `/api/sponsors/escrow-balance` - get current balance
  - Update escrow on successful payment
  - _Requirements: 2.2_

- [x] 2.4 Update task payment flow

  - **Update**: `backend/src/services/TaskService.ts`
  - On task approval, call `EscrowService.releaseFunds()`
  - Calculate 15-20% platform commission

  - Pay worker 80-85% of task amount
  - Update wallet balances
  - _Requirements: 2.3_

- [x] 2.5 Build sponsor escrow dashboard

  - **Create**: `Earn9ja/app/(sponsor)/escrow-dashboard.tsx`
  - Display available balance, reserved balance, total deposited
  - Show transaction history
  - Add "Deposit Funds" button
  - Display task performance metrics
  - _Requirements: 2.2_

### Task 3: Build Financial Monitoring System

- [x] 3.1 Create daily financial summary model

  - **Create**: `backend/src/models/DailyFinancialSummary.ts`
  - Fields: date, adRevenue, adExpenses, taskRevenue, bonusExpenses, netProfit
  - Add metrics subdocument for counts
  - _Requirements: 3.1_

- [x] 3.2 Build financial summary service

  - **Create**: `backend/src/services/FinancialSummaryService.ts`
  - `calculateDailySummary(date)` - aggregate all transactions
  - `getFinancialMetrics(period)` - get summary for period
  - `checkProfitability()` - check if day is profitable
  - Schedule daily calculation job
  - _Requirements: 3.1, 3.2_

- [x] 3.3 Create financial monitoring APIs

  - **Create**: `backend/src/routes/financial.routes.ts`
  - **Create**: `backend/src/controllers/financial.controller.ts`
  - GET `/api/admin/financial-summary` - today/week/month metrics
  - GET `/api/admin/profit-loss?period=daily|weekly|monthly`
  - Add admin-only middleware
  - _Requirements: 3.2_

- [x] 3.4 Build admin financial dashboard

  - **Create**: `Earn9ja/app/(admin)/financial-monitor.tsx`
  - Display today's profit/loss summary
  - Show revenue breakdown chart (ads vs tasks)
  - Show expense breakdown chart (rewards vs bonuses)
  - Display weekly/monthly trends
  - Add date range filters
  - _Requirements: 3.2_

- [ ] 3.5 Implement alert system

  - **Create**: `backend/src/services/AlertService.ts`

  - Monitor daily profit/loss
  - Send email alert when loss > ₦5,000
  - Send push notification to admin
  - Log alerts to database
  - _Requirements: 3.3_

### Task 4: Reduce Bonus System Expenses

- [x] 4.1 Reduce daily bonus amount

  - **Update**: `backend/src/services/DailyBonusService.ts`
  - Change daily bonus from ₦10 to ₦5
  - Add profit-based validation (only award if daily profit > 0)
  - Update bonus calculation logic
  - _Requirements: 4.1_

- [x] 4.2 Disable spin wheel feature

  - **Update**: `Earn9ja/app/(gamification)/spin-wheel.tsx`
  - Add feature flag check
  - Show "Coming Soon" message when disabled
  - **Update**: `backend/src/services/SpinWheelService.ts`
  - Add feature flag to prevent API calls
  - _Requirements: 4.2_

- [x] 4.3 Make referral bonuses conditional

  - **Update**: `backend/src/services/ReferralService.ts`
  - Track referee task completion count
  - Award ₦20 to referrer only after referee completes 5 tasks
  - Award ₦20 to referee after completing 5 tasks
  - Fund from ad profit pool
  - Send notification when bonus is earned
  - _Requirements: 4.3_

### Task 5: Implement Phased Launch Controller

- [x] 5.1 Create launch phase model

  - **Create**: `backend/src/models/LaunchPhase.ts`
  - Fields: currentPhase, phase1/2/3 progress tracking
  - Singleton document (only one record)
  - _Requirements: 5.1_

- [x] 5.2 Build launch controller service

  - **Create**: `backend/src/services/LaunchController.ts`
  - `validatePhase1()` - check 5 sponsors, ₦100K escrow, 20 tasks, 100 users
  - `validatePhase2()` - check 7 consecutive profitable days
  - `advancePhase()` - move to next phase
  - `getCurrentPhaseStatus()` - get progress
  - _Requirements: 5.1, 5.2_

- [x] 5.3 Implement user registration limits

  - **Update**: `backend/src/controllers/auth.controller.ts`
  - Check current phase before allowing registration
  - Phase 1: limit to 100 users
  - Phase 2: limit to 1,000 users
  - Phase 3: unlimited
  - Show waitlist message when limit reached
  - _Requirements: 5.3_

- [x] 5.4 Create launch phase APIs

  - **Create**: `backend/src/routes/launch.routes.ts`
  - **Create**: `backend/src/controllers/launch.controller.ts`
  - GET `/api/admin/launch-status` - get current phase and progress
  - POST `/api/admin/advance-phase` - manual override (admin only)
  - _Requirements: 5.1_

- [x] 5.5 Build launch status dashboard

  - **Create**: `Earn9ja/app/(admin)/launch-status.tsx`
  - Display current phase
  - Show progress bars for each requirement
  - Display validation status
  - Add manual phase advance button (admin only)
  - _Requirements: 5.1_

### Task 6: Create Sponsor Acquisition Tools

- [x] 6.1 Define sponsor packages

  - **Create**: `backend/src/models/SponsorPackage.ts`
  - Bronze: ₦20K/month, 100 tasks
  - Silver: ₦50K/month, 300 tasks
  - Gold: ₦100K/month, unlimited tasks
  - Add to User model as `sponsorPackage` field
  - _Requirements: 6.1_

- [x] 6.2 Build sponsor onboarding flow

  - **Create**: `Earn9ja/app/(sponsor)/onboarding/step-1.tsx` - Package selection
  - **Create**: `Earn9ja/app/(sponsor)/onboarding/step-2.tsx` - Business info
  - **Create**: `Earn9ja/app/(sponsor)/onboarding/step-3.tsx` - Initial deposit
  - **Create**: `Earn9ja/app/(sponsor)/onboarding/step-4.tsx` - First task
  - Send welcome email
  - _Requirements: 6.2_

- [x] 6.3 Create sponsor analytics dashboard

  - **Create**: `Earn9ja/app/(sponsor)/analytics-dashboard.tsx`
  - Task completion rates
  - ROI calculations
  - Worker engagement metrics
  - Cost per acquisition
  - Export reports
  - _Requirements: 6.2_

### Task 7: Testing

- [ ]\* 7.1 Financial calculation tests

  - **Create**: `backend/tests/services/FinancialSummaryService.test.ts`
  - Test profit/loss calculations
  - Test edge cases (negative profits, zero revenue)
  - _Requirements: All_

- [ ]\* 7.2 Escrow flow tests

  - **Create**: `backend/tests/services/EscrowService.test.ts`
  - Test deposit, reserve, release, refund flows
  - Test commission calculations
  - _Requirements: 2.1, 2.2, 2.3_

- [ ]\* 7.3 End-to-end tests
  - **Create**: `Earn9ja/tests/e2e/payment-flows.test.ts`
  - Test complete sponsor → worker payment flow
  - Test ad watching → reward flow
  - _Requirements: All_

### Task 8: Production Deployment

- [x] 8.1 Prepare environment

  - Update `.env` files with production values
  - Configure MongoDB indexes
  - Set up Redis caching
  - _Requirements: All_

- [x] 8.2 Deploy backend

  - Deploy updated backend services
  - Run any necessary data migrations
  - Verify all APIs working
  - _Requirements: All_

- [x] 8.3 Deploy mobile app

  - Build production app bundle
  - Submit to Google Play Store
  - Monitor for errors
  - _Requirements: All_

- [x] 8.4 Configure monitoring

  - Set up Sentry error tracking
  - Configure financial alerts
  - Set up performance monitoring
  - _Requirements: 3.3_

## Sprint Planning

### Sprint 1 (Week 1): Stop the Bleeding

**Goal**: Fix ad economics and reduce bonus expenses

- Task 1.1: Update AdMob reward configuration
- Task 1.2: Update backend AdMob service
- Task 1.3: Update AdMob reward API
- Task 4.1: Reduce daily bonus
- Task 4.2: Disable spin wheel
- Task 4.3: Conditional referral bonuses

**Expected Impact**: Stop losing ₦0.70-₦1.20 per ad, reduce bonus expenses by 50%

### Sprint 2 (Week 2): Escrow System

**Goal**: Enable sponsor deposits and secure fund management

- Task 2.1: Create Mongoose models
- Task 2.2: Build escrow service
- Task 2.3: Integrate deposit flow
- Task 2.4: Update task payment flow
- Task 2.5: Build sponsor dashboard

**Expected Impact**: Enable sponsor revenue stream, secure fund management

### Sprint 3 (Week 3): Monitoring & Launch Control

**Goal**: Track profitability and control user growth

- Task 3.1-3.5: Complete financial monitoring system
- Task 5.1-5.5: Complete launch phase controller

**Expected Impact**: Real-time profit visibility, controlled scaling

### Sprint 4 (Week 4): Polish & Deploy

**Goal**: Sponsor tools and production launch

- Task 6.1-6.3: Sponsor acquisition tools
- Task 7.1-7.3: Testing
- Task 8.1-8.4: Production deployment

**Expected Impact**: Attract sponsors, launch profitably

## Success Metrics

After implementation, you should see:

1. **Ad Profitability**: ₦0.20-₦0.25 profit per ad (currently losing ₦0.70)
2. **Daily Profit**: Positive daily profit within 7 days
3. **Sponsor Revenue**: ₦100K+ in escrow within 30 days
4. **Controlled Growth**: User growth matches revenue capacity
5. **Financial Visibility**: Real-time profit/loss tracking

## Risk Mitigation

- **User Backlash on Lower Rewards**: Communicate value (more sustainable platform, better long-term opportunities)
- **Sponsor Acquisition**: Start with 5 pilot sponsors before full launch
- **Technical Issues**: Thorough testing before production deployment
- **Cash Flow**: Ensure escrow deposits before scaling users
