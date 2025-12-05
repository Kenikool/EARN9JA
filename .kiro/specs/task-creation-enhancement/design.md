# Task Creation Enhancement - Design Document

## Overview

This design document outlines the technical architecture and UI/UX specifications for enhancing the Earn9ja task creation system. The design follows a mobile-first approach, leveraging existing React Native components while introducing new patterns for advanced features like image uploads, auto-save, templates, and targeting.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Task Creation│  │   Template   │  │   Preview    │ │
│  │    Screen    │  │   Gallery    │  │    Modal     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Draft Manager│  │Image Uploader│  │  Validation  │ │
│  │   Service    │  │   Service    │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Task API    │  │ Template API │  │  Upload API  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   MongoDB    │  │  Cloudinary  │  │    Redis     │ │
│  │   Database   │  │Image Storage │  │    Cache     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Task Creation Flow**

   - User opens create-task screen
   - Draft manager checks for existing drafts
   - Form loads with draft data or empty state
   - User fills form with auto-save every 30s
   - Images uploaded to Cloudinary on selection
   - Form validation runs in real-time
   - Submit triggers escrow creation and task publication

2. **Template Application Flow**
   - User selects template from gallery
   - Template data pre-fills form fields
   - User customizes template values
   - Variables replaced with actual data
   - Standard creation flow continues

## Components and Interfaces

### 1. Image Upload System

#### ImageUploader Component

```typescript
interface ImageUploaderProps {
  maxImages: number; // Default: 5
  maxSizePerImage: number; // Default: 5MB
  onImagesChange: (images: TaskImage[]) => void;
  existingImages?: TaskImage[];
  disabled?: boolean;
}

interface TaskImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  order: number;
  uploadProgress?: number;
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Reference Images (Optional)             │
├─────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐│
│ │ IMG 1 │ │ IMG 2 │ │ IMG 3 │ │  +    ││
│ │   ×   │ │   ×   │ │   ×   │ │ ADD   ││
│ └───────┘ └───────┘ └───────┘ └───────┘│
│                                         │
│ 📷 Tap to add images (3/5)             │
│ Max 5MB each • JPG, PNG, WebP          │
└─────────────────────────────────────────┘
```

**Features:**

- Drag & drop support (web)
- Camera/gallery picker (mobile)
- Real-time compression using react-native-image-compressor
- Progress indicators during upload
- Preview grid with remove buttons
- Reordering capability

### 2. Draft Auto-Save System

#### DraftManager Service

```typescript
interface DraftManager {
  saveDraft(formData: TaskFormData): Promise<void>;
  loadDraft(userId: string): Promise<TaskDraft | null>;
  deleteDraft(draftId: string): Promise<void>;
  autoSave(formData: TaskFormData, interval: number): void;
}

interface TaskDraft {
  id: string;
  userId: string;
  formData: TaskFormData;
  lastSaved: Date;
  expiresAt: Date;
}
```

**UI Indicators:**

```
Header: [Create Task              💾 Saved]
Footer: [📝 Draft saved 2 minutes ago     ]
```

**Draft Recovery Modal:**

```
┌─────────────────────────────────────────┐
│         Draft Found                     │
├─────────────────────────────────────────┤
│ You have an unsaved draft from          │
│ 2 hours ago. Continue where you left?  │
│                                         │
│ Task: "Follow Instagram Account"        │
│ Progress: Step 2 of 3                  │
│                                         │
│ [Continue Draft]  [Start Fresh]        │
└─────────────────────────────────────────┘
```

**Implementation:**

- Local storage for offline capability
- Backend sync when online
- Debounced save (500ms delay)
- Visual feedback on save status
- Automatic cleanup after 7 days

### 3. Task Templates System

#### Template Data Structure

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  category: TaskCategory;
  description: string;
  icon: string;
  rating: number;
  usageCount: number;
  isPublic: boolean;
  createdBy: string;
  template: {
    title: string;
    description: string;
    category: string;
    platform?: string;
    requirements: string[];
    suggestedReward: { min: number; max: number };
    estimatedTime: number;
    variables?: TemplateVariable[];
  };
}

interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "number" | "url";
  placeholder: string;
  required: boolean;
}
```

**Template Gallery UI:**

```
┌─────────────────────────────────────────┐
│ Choose Template            [Skip]       │
├─────────────────────────────────────────┤
│ 🔍 Search templates...                  │
├─────────────────────────────────────────┤
│ 📱 Social Media (12)                   │
│ ⭐ Reviews (8)                          │
│ 📊 Surveys (6)                         │
│ 🎵 Music (10)                          │
│ 🎮 Games (7)                           │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │📱 Insta │ │📘 Face  │ │🐦 Tweet │   │
│ │ Follow  │ │ Like    │ │ Retweet │   │
│ │ 50-100₦ │ │ 30-80₦  │ │ 40-90₦  │   │
│ │ ⭐⭐⭐⭐⭐ │ │ ⭐⭐⭐⭐   │ │ ⭐⭐⭐⭐⭐  │   │
│ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

**Built-in Templates:**

- Instagram Follow/Like/Comment
- Facebook Like/Share
- Twitter Follow/Retweet
- TikTok Follow/Like
- YouTube Subscribe/Like
- Google Review
- App Store Review
- Product Review
- Market Research Survey
- Feedback Collection
- Spotify Follow
- SoundCloud Like
- App Download
- Game Level Achievement

### 4. Geographic Targeting

#### GeographicTargeting Component

```typescript
interface GeographicTargetingProps {
  onTargetingChange: (targeting: TaskTargeting) => void;
  initialTargeting?: TaskTargeting;
}

interface TaskTargeting {
  countries: Country[];
  states: State[];
  cities: City[];
  radiusTargeting?: {
    centerLat: number;
    centerLng: number;
    radiusKm: number;
  };
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Target Locations                        │
├─────────────────────────────────────────┤
│ ○ All Countries (Global)                │
│ ● Specific Countries                    │
├─────────────────────────────────────────┤
│ 🇳🇬 Nigeria          [×]               │
│ 🇬🇭 Ghana            [×]               │
│ 🇰🇪 Kenya            [×]               │
│                                         │
│ [+ Add Country]                         │
├─────────────────────────────────────────┤
│ 📍 Refine by States/Cities              │
│ Nigeria: Lagos, Abuja, Kano            │
│ Ghana: Accra, Kumasi                   │
│                                         │
│ Estimated Audience: ~2.3M users        │
│ Price Adjustment: +15%                  │
└─────────────────────────────────────────┘
```

**Features:**

- Multi-select country dropdown
- State/province filtering
- Major city selection
- Radius-based targeting with map
- Real-time audience estimation
- Dynamic pricing calculation

### 5. Task Preview Mode

#### TaskPreview Component

```typescript
interface TaskPreviewProps {
  taskData: Partial<Task>;
  userType: "new" | "experienced";
  onClose: () => void;
}
```

**Preview Modal UI:**

```
┌─────────────────────────────────────────┐
│ Worker View Preview            [×]      │
├─────────────────────────────────────────┤
│ 📱 Follow @username on Instagram        │
│ 💰 ₦75 • ⏱️ ~5 min • 📍 Nigeria        │
├─────────────────────────────────────────┤
│ Follow our Instagram account and        │
│ help us grow our community.             │
│                                         │
│ 📋 Requirements:                        │
│ ✓ Screenshot of follow action           │
│ ✓ Profile must be public               │
│ ✓ Account age > 7 days                 │
│                                         │
│ 🖼️ [Reference Images]                   │
│                                         │
│ [Accept Task] [Report Issue]           │
├─────────────────────────────────────────┤
│ 👤 Viewing as: New Worker              │
│ [Switch to Experienced] [Share]         │
└─────────────────────────────────────────┘
```

**Features:**

- Real-time preview updates
- User perspective switching
- Mobile-responsive rendering
- Shareable preview URLs
- Matches exact worker view

### 6. Enhanced Input Components

#### Character Counter Input

```typescript
interface EnhancedInputProps extends InputProps {
  showCharacterCount?: boolean;
  showWordCount?: boolean;
  maxLength: number;
  minLength?: number;
  optimizationHints?: boolean;
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Task Title *                            │
│ Follow our Instagram account            │
│ ────────────────────────────────────────│
│ 32/100 characters • Good length ✅     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Description *                           │
│ ┌─────────────────────────────────────┐ │
│ │ Follow our Instagram account and    │ │
│ │ help us grow our community.         │ │
│ │ Screenshot required for proof.      │ │
│ └─────────────────────────────────────┘ │
│ 156/500 chars • 23 words • Good ✅     │
│ 💡 Add more details for clarity        │
└─────────────────────────────────────────┘
```

**Color Coding:**

- Green (0-70%): "Good length ✅"
- Yellow (70-90%): "Consider shortening ⚠️"
- Red (90-100%): "Too long ❌"
- Red (under min): "Too short - add details ❌"

### 7. Requirement Builder

#### RequirementBuilder Component

```typescript
interface RequirementBuilderProps {
  category: TaskCategory;
  onRequirementsChange: (requirements: string[]) => void;
  initialRequirements?: string[];
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Requirements                            │
├─────────────────────────────────────────┤
│ 1. Screenshot of completed action       │
│    [Edit] [Remove]                      │
│                                         │
│ 2. Profile must be public              │
│    [Edit] [Remove]                      │
│                                         │
│ [+ Add Custom] [+ From Templates]       │
├─────────────────────────────────────────┤
│ 💡 Suggested for Instagram Follow:      │
│ • Account age > 30 days                │
│ • Minimum 100 followers                │
│ • Previous task success rate > 80%     │
│                                         │
│ [Add All] [Add Selected]               │
└─────────────────────────────────────────┘
```

**Common Requirements Library:**

- Screenshot of completed action
- Screen recording (video)
- Profile must be public
- Account age > X days
- Minimum followers count
- Task success rate > X%
- Account reputation > X stars
- Device verification required

### 8. Bulk Task Creation

#### BulkTaskCreator Component

```typescript
interface BulkTaskCreatorProps {
  onBulkCreate: (tasks: BulkTaskData[]) => Promise<void>;
}

interface BulkTaskData {
  title: string;
  description: string;
  platform: string;
  targetUrl: string;
  reward: number;
  slots: number;
  expiryDays: number;
  requirements?: string[];
}
```

**CSV Upload UI:**

```
┌─────────────────────────────────────────┐
│ Upload CSV File                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │     📄 Drag CSV file here           │ │
│ │        or click to browse           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📋 [Download Template]                  │
│                                         │
│ Required Columns:                       │
│ • title, description, platform          │
│ • target_url, reward, slots            │
│                                         │
│ Optional Columns:                       │
│ • expiry_days, requirements             │
└─────────────────────────────────────────┘
```

**Validation Results:**

```
┌─────────────────────────────────────────┐
│ Validation Results                      │
├─────────────────────────────────────────┤
│ ✅ 47 tasks ready to create             │
│ ⚠️ 3 tasks have warnings                │
│ ❌ 2 tasks have errors                  │
├─────────────────────────────────────────┤
│ Warnings:                               │
│ • Row 5: Reward below minimum           │
│ • Row 12: URL format suspicious         │
│ • Row 23: Description too short         │
│                                         │
│ Errors:                                 │
│ • Row 8: Invalid platform              │
│ • Row 15: Missing required field        │
│                                         │
│ [Fix Errors] [Create Valid Tasks]       │
└─────────────────────────────────────────┘
```

### 9. Task Scheduling

#### TaskScheduler Component

```typescript
interface TaskSchedulerProps {
  onScheduleChange: (schedule: TaskSchedule) => void;
  initialSchedule?: TaskSchedule;
}

interface TaskSchedule {
  type: "immediate" | "scheduled" | "recurring";
  startDate?: Date;
  startTime?: string;
  timezone: string;
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly";
    daysOfWeek?: number[];
    endDate?: Date;
  };
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Task Scheduling                         │
├─────────────────────────────────────────┤
│ ● Publish Immediately                   │
│ ○ Schedule for Later                    │
│ ○ Recurring Schedule                    │
├─────────────────────────────────────────┤
│ Start Date: [March 15, 2024    ▼]      │
│ Start Time: [09:00 AM          ▼]      │
│ Timezone:   [WAT (UTC+1)       ▼]      │
│                                         │
│ 📅 Task will go live in 2 days         │
│ ⏰ Optimal time for your audience       │
└─────────────────────────────────────────┘
```

### 10. Budget Management

#### BudgetManager Component

```typescript
interface BudgetManagerProps {
  onBudgetChange: (budget: TaskBudget) => void;
  initialBudget?: TaskBudget;
}

interface TaskBudget {
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  autoPause: boolean;
  alertThresholds: number[]; // e.g., [50, 80, 90]
}
```

**UI Design:**

```
┌─────────────────────────────────────────┐
│ Budget Management                       │
├─────────────────────────────────────────┤
│ ○ No Budget Limit                       │
│ ● Set Budget Limits                     │
├─────────────────────────────────────────┤
│ Daily Limit:   [₦5,000        ]        │
│ Weekly Limit:  [₦25,000       ]        │
│ Monthly Limit: [₦100,000      ]        │
│                                         │
│ Current Spending:                       │
│ Today: ₦2,340 / ₦5,000 (47%)          │
│ This Week: ₦8,920 / ₦25,000 (36%)    │
│ This Month: ₦34,560 / ₦100,000        │
│                                         │
│ ⚠️ Auto-pause tasks when limit hit      │
│ 📧 Alert me at 80% of limit            │
└─────────────────────────────────────────┘
```

## Data Models

### Database Schema Extensions

```typescript
// TaskImage Model
interface TaskImageSchema {
  _id: ObjectId;
  taskId: ObjectId;
  url: string;
  filename: string;
  size: number;
  order: number;
  createdAt: Date;
}

// TaskDraft Model
interface TaskDraftSchema {
  _id: ObjectId;
  userId: ObjectId;
  formData: any;
  lastSaved: Date;
  expiresAt: Date;
  createdAt: Date;
}

// TaskTemplate Model
interface TaskTemplateSchema {
  _id: ObjectId;
  name: string;
  category: string;
  description: string;
  template: any;
  isPublic: boolean;
  createdBy: ObjectId;
  usageCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// TaskTargeting Model
interface TaskTargetingSchema {
  _id: ObjectId;
  taskId: ObjectId;
  countries: string[];
  states: string[];
  cities: string[];
  radiusTargeting?: {
    centerLat: number;
    centerLng: number;
    radiusKm: number;
  };
}

// TaskBudget Model
interface TaskBudgetSchema {
  _id: ObjectId;
  taskId: ObjectId;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  totalSpent: number;
  isActive: boolean;
  alertThresholds: number[];
  autoPause: boolean;
}

// TaskSchedule Model
interface TaskScheduleSchema {
  _id: ObjectId;
  taskId: ObjectId;
  type: "scheduled" | "recurring";
  startDate: Date;
  timezone: string;
  recurrence?: {
    frequency: string;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  status: "pending" | "active" | "completed";
}
```

## Error Handling

### Validation Errors

- Real-time field validation
- Clear error messages
- Suggested corrections
- Prevent submission with errors

### Upload Errors

- Retry mechanism for failed uploads
- Fallback to smaller image sizes
- Clear error feedback
- Offline queue support

### Network Errors

- Graceful degradation
- Local storage fallback
- Retry with exponential backoff
- User-friendly error messages

## Testing Strategy

### Unit Tests

- Component rendering
- Form validation logic
- Draft save/load functionality
- Image compression
- URL validation

### Integration Tests

- End-to-end task creation flow
- Template application
- Bulk upload processing
- Geographic targeting
- Budget calculations

### Performance Tests

- Image upload speed
- Auto-save performance impact
- Template gallery load time
- Form responsiveness
- Database query optimization

## Accessibility

- Screen reader support for all components
- Keyboard navigation
- High contrast mode
- Touch target sizes (44px minimum)
- Clear focus indicators
- Alt text for images
- ARIA labels for interactive elements

## Performance Considerations

- Lazy loading for template gallery
- Image compression before upload
- Debounced auto-save (500ms)
- Optimistic UI updates
- Efficient form state management
- Cached template data
- Indexed database queries
- CDN for image delivery

This design provides a comprehensive foundation for implementing all 15 requirements while maintaining consistency with the existing Earn9ja design system.
