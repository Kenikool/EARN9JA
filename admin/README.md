# Earn9ja Admin Panel

Modern admin dashboard built with React, Vite, TailwindCSS v4, and DaisyUI v5.

## Features

- ✅ Login with admin credentials
- ✅ Dashboard with stats
- ✅ User management
- ✅ DaisyUI components and themes
- ✅ Responsive design
- ✅ React Query for data fetching
- ✅ React Router for navigation
- ✅ Toast notifications

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
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Users.tsx
│   │   ├── Tasks.tsx
│   │   ├── Withdrawals.tsx
│   │   ├── Analytics.tsx
│   │   └── Settings.tsx
│   ├── store/
│   │   └── authStore.ts
│   ├── lib/
│   │   └── api.ts
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

1. Complete Tasks management page
2. Complete Withdrawals management page
3. Complete Analytics dashboard
4. Add settings page with theme switcher
5. Add user detail modal
6. Add charts and graphs
7. Add export functionality

## Support

For issues or questions, contact: support@earn9ja.site
