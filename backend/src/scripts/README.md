# Database Seed Scripts

This directory contains scripts to populate the database with initial data.

## Available Scripts

### Seed Templates

Populates the database with 15 official task templates (3 per category):

- **Social Media** (3 templates): Instagram, TikTok, YouTube
- **Music** (3 templates): Spotify, Audiomack, Boomplay
- **Survey** (3 templates): Product Feedback, Market Research, UX Feedback
- **Review** (3 templates): Google Business, App Store, E-commerce
- **Game** (3 templates): Download & Play, Level Achievement, Game Review

#### Usage

```bash
# From the backend directory
npm run seed:templates
```

#### What it does

1. Connects to MongoDB
2. Clears existing official templates
3. Inserts 15 new templates
4. Shows summary by category
5. Disconnects from database

#### Template Structure

Each template includes:

- Name and description
- Category, platform, and task type
- Pre-filled task data (title, description, requirements)
- Estimated time
- Target URL with variables
- Usage count tracking

#### After Seeding

Templates will be available in the app's "Use a Template" feature when creating tasks. Users can:

- Browse templates by category
- Search for specific templates
- Apply templates to pre-fill task creation forms
- Customize template data before publishing

## Notes

- Templates are marked as `isOfficial: true`
- Running the seed script multiple times will replace existing official templates
- Custom user-created templates are not affected
