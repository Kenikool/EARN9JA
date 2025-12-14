# DaisyUI Theme Fix Guide

## Color Replacements

Replace all hardcoded Tailwind colors with DaisyUI semantic colors:

### Background Colors

- `bg-white` → `bg-base-100`
- `bg-gray-50` → `bg-base-200`
- `bg-gray-100` → `bg-base-300`

### Text Colors

- `text-gray-900` → `text-base-content`
- `text-gray-800` → `text-base-content`
- `text-gray-700` → `text-base-content/80`
- `text-gray-600` → `text-base-content/60`
- `text-gray-500` → `text-base-content/50`
- `text-gray-400` → `text-base-content/40`
- `text-gray-300` → `text-base-content/30`

### Border Colors

- `border-gray-200` → `border-base-300`
- `border-gray-300` → `border-base-300`

### Semantic Colors (keep these, they're already theme-aware)

- `text-green-600` → `text-success`
- `text-red-600` → `text-error`
- `text-yellow-600` → `text-warning`
- `text-blue-600` → `text-info`
- `bg-green-50` → `bg-success/10`
- `bg-red-50` → `bg-error/10`
- `bg-yellow-50` → `bg-warning/10`

## Files That Need Fixing

1. ✅ Dashboard (Dashborad.tsx) - FIXED
2. ✅ Search.tsx - FIXED
3. ✅ Users.tsx - PARTIALLY FIXED
4. ❌ Tasks.tsx - NEEDS FIX
5. ❌ Withdrawals.tsx - NEEDS FIX
6. ❌ Disputes.tsx - NEEDS FIX
7. ❌ Analytics.tsx - NEEDS FIX
8. ❌ Settings.tsx - NEEDS FIX
9. ❌ Notifications.tsx - CHECK IF NEEDED

## Quick Find & Replace

Use your IDE's find and replace feature (Ctrl+Shift+H) to replace across all files in `admin/src/pages/`:

1. `bg-white` → `bg-base-100`
2. `text-gray-900` → `text-base-content`
3. `text-gray-600` → `text-base-content/60`
4. `text-gray-500` → `text-base-content/50`
5. `text-gray-400` → `text-base-content/40`
6. `text-gray-300` → `text-base-content/30`
7. `border-gray-200` → `border-base-300`

## Theme Persistence

✅ Theme now persists to localStorage and loads on page refresh.
