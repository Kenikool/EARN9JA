# Earn9ja Admin Panel

Modern admin dashboard built with React, Vite, TailwindCSS v4, and DaisyUI v5.

## Current Status

This is the initial setup with authentication only. Dashboard features will be implemented based on the spec.

## Features

- ✅ Login with admin credentials
- ✅ Admin registration with OTP verification
- ✅ DaisyUI components and themes
- ✅ Responsive design
- ✅ React Query for data fetching
- ✅ React Router for navigation
- ✅ Toast notifications
- ⏳ Dashboard (to be implemented)
- ⏳ User management (to be implemented)
- ⏳ Task management (to be implemented)
- ⏳ Withdrawal management (to be implemented)
- ⏳ Analytics (to be implemented)
- ⏳ Settings (to be implemented)

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS v4** - Styling
- **DaisyUI v5** - UI components
- **React Router** - Routing
- **React Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_API_URL=https://api.earn9ja.site/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

## Default Admin Credentials

```
Email: admin@earn9ja.site
Password: Admin@Earn9ja2024!
```

**⚠️ Change password after first login!**

## Project Structure

```
admin/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── store/
│   │   └── authStore.ts
│   ├── lib/
│   │   └── api.ts
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── package.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## DaisyUI Themes

The app uses all DaisyUI themes. Users can switch themes in settings (coming soon).

Available themes: light, dark, cupcake, bumblebee, emerald, corporate, synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim, nord, sunset

## API Integration

The admin panel connects to the Earn9ja backend API at `https://api.earn9ja.site/api/v1`.

All API calls are authenticated with JWT tokens stored in localStorage.

## Next Steps

The admin panel will be built following a spec-driven approach:

1. Create comprehensive requirements document
2. Design the admin panel architecture
3. Implement features incrementally:
   - Dashboard with platform statistics
   - User management (view, suspend, ban, reactivate)
   - Task management (approve, reject, monitor)
   - Withdrawal management (approve, reject, process)
   - Analytics and reporting
   - Settings and configuration

## Support

For issues or questions, contact: support@earn9ja.site
