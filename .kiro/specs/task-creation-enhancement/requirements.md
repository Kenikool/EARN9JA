# Task Creation Enhancement - Requirements

## Introduction

This specification defines the requirements for enhancing the Earn9ja task creation system to achieve competitive parity with industry-leading micro-task platforms like Jumpstack, Picoworkers, and similar services. The current system provides basic task creation functionality but lacks 18+ critical features that prevent optimal sponsor experience and platform scalability.

## Glossary

- **Sponsor System**: The platform component that enables users to create and manage tasks for workers to complete
- **Task Creation Flow**: The multi-step process sponsors use to define, configure, and publish tasks
- **Draft System**: Functionality that automatically saves incomplete task creation progress
- **Template System**: Pre-configured task structures that sponsors can use as starting points
- **Geographic Targeting**: Feature allowing sponsors to restrict tasks to specific locations
- **Escrow System**: Financial mechanism that holds sponsor funds until task completion

## Requirements

### Requirement 1: Image Upload System

**User Story:** As a sponsor, I want to upload reference images to my tasks so that workers can clearly understand what I need them to do.

#### Acceptance Criteria

1. WHEN THE Sponsor System uploads an image, THE Sponsor System SHALL compress the image to maximum 1MB size
2. WHEN THE Sponsor System receives an image upload, THE Sponsor System SHALL validate the format is JPG, PNG, or WebP
3. THE Sponsor System SHALL allow sponsors to upload between 1 and 5 images per task
4. WHEN THE Sponsor System displays uploaded images, THE Sponsor System SHALL show a preview grid with remove buttons
5. WHEN THE Sponsor System uploads images, THE Sponsor System SHALL display real-time progress indicators

### Requirement 2: Draft Auto-Save System

**User Story:** As a sponsor, I want my task creation progress saved automatically so that I don't lose my work if I navigate away or close the app.

#### Acceptance Criteria

1. WHEN THE Sponsor System detects form changes, THE Sponsor System SHALL save draft data within 30 seconds
2. THE Sponsor System SHALL store draft data in both local storage and backend database
3. WHEN THE Sponsor System detects a saved draft, THE Sponsor System SHALL display a recovery modal on form load
4. THE Sponsor System SHALL delete draft data after 7 days of inactivity
5. WHEN THE Sponsor System saves a draft, THE Sponsor System SHALL display a visual "Saved" indicator

### Requirement 3: Task Duplication

**User Story:** As a sponsor, I want to duplicate existing tasks so that I can quickly create similar campaigns without re-entering all information.

#### Acceptance Criteria

1. THE Sponsor System SHALL provide a "Duplicate" action for all published tasks
2. WHEN THE Sponsor System duplicates a task, THE Sponsor System SHALL copy all fields except completion statistics
3. WHEN THE Sponsor System duplicates a task, THE Sponsor System SHALL prepend "Copy of" to the task title
4. THE Sponsor System SHALL allow sponsors to edit duplicated tasks before publishing
5. WHEN THE Sponsor System duplicates a task with images, THE Sponsor System SHALL copy all image references

### Requirement 4: Flexible Task Expiry

**User Story:** As a sponsor, I want to set custom expiry dates for my tasks so that I can align campaigns with my marketing schedule.

#### Acceptance Criteria

1. THE Sponsor System SHALL provide preset expiry options of 1, 3, 7, 14, and 30 days
2. THE Sponsor System SHALL provide a custom date picker for expiry dates beyond presets
3. WHEN THE Sponsor System calculates expiry, THE Sponsor System SHALL handle timezone conversions correctly
4. WHEN a task reaches expiry, THE Sponsor System SHALL automatically pause the task
5. THE Sponsor System SHALL allow sponsors to extend expiry for active tasks

### Requirement 5: URL Validation

**User Story:** As a sponsor, I want invalid URLs to be caught during task creation so that workers don't encounter broken links.

#### Acceptance Criteria

1. WHEN THE Sponsor System receives a URL input, THE Sponsor System SHALL validate the format in real-time
2. THE Sponsor System SHALL display visual feedback (green/red border) based on URL validity
3. THE Sponsor System SHALL recognize social media URL patterns for Instagram, Twitter, Facebook, TikTok, and YouTube
4. WHEN THE Sponsor System detects an invalid URL, THE Sponsor System SHALL suggest common corrections
5. THE Sponsor System SHALL provide a "Test URL" button to verify URL accessibility

### Requirement 6: Task Templates System

**User Story:** As a sponsor, I want to use pre-built templates for common tasks so that I can create campaigns faster with best practices built-in.

#### Acceptance Criteria

1. THE Sponsor System SHALL provide at least 15 templates per task category
2. WHEN THE Sponsor System displays templates, THE Sponsor System SHALL show template name, description, and suggested pricing
3. THE Sponsor System SHALL allow sponsors to create and save custom templates
4. WHEN THE Sponsor System applies a template, THE Sponsor System SHALL pre-fill all form fields with template data
5. THE Sponsor System SHALL provide template search and filtering by category

### Requirement 7: Geographic Targeting

**User Story:** As a sponsor, I want to target users in specific locations so that my location-relevant tasks reach the right audience.

#### Acceptance Criteria

1. THE Sponsor System SHALL allow country-level targeting with multi-select capability
2. THE Sponsor System SHALL provide state/province targeting within selected countries
3. THE Sponsor System SHALL provide city targeting for major cities
4. WHEN THE Sponsor System applies geographic targeting, THE Sponsor System SHALL display estimated audience size
5. WHEN THE Sponsor System calculates pricing, THE Sponsor System SHALL adjust costs based on geographic restrictions

### Requirement 8: Task Preview Mode

**User Story:** As a sponsor, I want to preview how my task appears to workers so that I can ensure it looks correct before publishing.

#### Acceptance Criteria

1. THE Sponsor System SHALL provide a "Preview as Worker" button during task creation
2. WHEN THE Sponsor System displays preview, THE Sponsor System SHALL render the exact worker view
3. THE Sponsor System SHALL update preview in real-time as form fields change
4. THE Sponsor System SHALL allow sponsors to switch between new worker and experienced worker perspectives
5. THE Sponsor System SHALL generate shareable preview URLs for feedback collection

### Requirement 9: Character Counters and Input Enhancements

**User Story:** As a sponsor, I want to see character limits in real-time so that I can optimize my task content for better engagement.

#### Acceptance Criteria

1. THE Sponsor System SHALL display live character counters on all text input fields
2. WHEN character count reaches 80% of limit, THE Sponsor System SHALL change counter color to yellow
3. WHEN character count reaches 95% of limit, THE Sponsor System SHALL change counter color to red
4. THE Sponsor System SHALL display word count for description fields
5. WHEN THE Sponsor System detects suboptimal content length, THE Sponsor System SHALL provide optimization suggestions

### Requirement 10: Requirement Templates and Suggestions

**User Story:** As a sponsor, I want suggested requirements based on my task type so that I can ensure quality submissions without manual configuration.

#### Acceptance Criteria

1. THE Sponsor System SHALL provide common requirement templates for each task category
2. WHEN THE Sponsor System detects task category selection, THE Sponsor System SHALL suggest relevant requirements
3. THE Sponsor System SHALL allow one-click addition of suggested requirements
4. THE Sponsor System SHALL provide a custom requirement builder interface
5. WHEN THE Sponsor System adds requirements, THE Sponsor System SHALL display difficulty impact on task completion rate

### Requirement 11: Bulk Task Creation

**User Story:** As a power sponsor, I want to create multiple similar tasks at once so that I can scale my campaigns efficiently.

#### Acceptance Criteria

1. THE Sponsor System SHALL accept CSV file uploads for bulk task creation
2. WHEN THE Sponsor System processes CSV data, THE Sponsor System SHALL validate all rows before creation
3. THE Sponsor System SHALL provide variable substitution for template-based bulk creation
4. WHEN THE Sponsor System encounters errors, THE Sponsor System SHALL display detailed error reports with row numbers
5. THE Sponsor System SHALL display progress tracking for bulk operations

### Requirement 12: Task Scheduling System

**User Story:** As a sponsor, I want to schedule tasks to go live at specific times so that I can optimize for peak worker engagement.

#### Acceptance Criteria

1. THE Sponsor System SHALL allow sponsors to schedule future start dates and times
2. THE Sponsor System SHALL support timezone selection for scheduled tasks
3. THE Sponsor System SHALL provide recurring schedule options (daily, weekly, monthly)
4. WHEN scheduled time arrives, THE Sponsor System SHALL automatically activate the task
5. THE Sponsor System SHALL allow modification of scheduled tasks before activation

### Requirement 13: Budget Management System

**User Story:** As a sponsor, I want to set spending limits so that I can control my campaign costs and prevent overspending.

#### Acceptance Criteria

1. THE Sponsor System SHALL allow sponsors to set daily, weekly, and monthly budget caps
2. WHEN budget limit is reached, THE Sponsor System SHALL automatically pause affected tasks
3. THE Sponsor System SHALL send alerts when spending reaches 50%, 80%, and 90% of budget
4. THE Sponsor System SHALL provide budget rollover options for unused allocations
5. THE Sponsor System SHALL display real-time spending analytics against budget limits

### Requirement 14: Advanced Targeting System

**User Story:** As a sponsor, I want to target specific user demographics so that my tasks reach the most relevant workers.

#### Acceptance Criteria

1. THE Sponsor System SHALL provide age range targeting options
2. THE Sponsor System SHALL provide gender targeting options
3. THE Sponsor System SHALL provide device type targeting (iOS/Android)
4. THE Sponsor System SHALL provide user reputation level targeting
5. WHEN THE Sponsor System applies targeting, THE Sponsor System SHALL display estimated audience size and pricing impact

### Requirement 15: A/B Testing System

**User Story:** As a sponsor, I want to test different task variations so that I can optimize performance based on data.

#### Acceptance Criteria

1. THE Sponsor System SHALL allow sponsors to create up to 3 task variants
2. THE Sponsor System SHALL provide configurable traffic split percentages
3. WHEN THE Sponsor System collects sufficient data, THE Sponsor System SHALL calculate statistical significance
4. THE Sponsor System SHALL provide automatic winner selection based on completion rate
5. THE Sponsor System SHALL display comparative analytics for all variants

## Success Metrics

### Phase 1 (Critical Features)
- 90% reduction in task creation abandonment rate
- 50% faster task creation time for repeat sponsors
- 95% valid URLs on first submission
- Zero data loss incidents from navigation or crashes

### Phase 2 (High Value Features)
- 70% of sponsors use templates within first month
- 40% improvement in task completion rates with geographic targeting
- 60% reduction in task revision requests
- 80% sponsor satisfaction score with preview feature

### Phase 3 (Competitive Edge)
- 30% of power sponsors adopt bulk creation
- 25% improvement in campaign ROI with advanced targeting
- 50% increase in scheduled task usage
- 20% improvement in task performance with A/B testing

## Constraints

- Image storage costs must not exceed ₦50 per sponsor per month
- Draft auto-save must not impact form performance (< 100ms delay)
- All features must work offline with graceful degradation
- Geographic targeting must support Nigeria, Ghana, Kenya, and South Africa initially
- Budget management must integrate with existing escrow system
