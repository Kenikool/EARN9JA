# E-Commerce Store - Dependencies

## Client Dependencies

### Core

```json
{
  "react": "",
  "react-dom": "",
  "react-router-dom": ""
}
```

### State Management & Data Fetching

```json
{
  "@tanstack/react-query": "",
  "zustand": ""
}
```

**Note:** This project uses:
- **React Query** for server state management (data fetching, caching, synchronization)
- **Zustand** for client state management (UI state, cart, etc.)

### Form Handling

```json
{
  "react-hook-form": "",
  "@hookform/resolvers": "",
  "zod": ""
}
```

### HTTP Client

```json
{
  "axios": ""
}
```

### Payment Integration (Multi-Gateway)

```json
{
  "@stripe/stripe-js": "",
  "@stripe/react-stripe-js": "",
  "flutterwave-react-v3": "",
  "react-paystack": ""
}
```

**Note:** This project supports multiple payment gateways:
- **Stripe** - International payments (cards, wallets)
- **Flutterwave** - African payments (cards, mobile money, bank transfers)
- **Paystack** - Nigerian & African payments

### UI & Styling

```json
{
  "tailwindcss": "",
  "@tailwindcss/vite": "",
  "daisyui": "",
  "lucide-react": ""
}
```

### Rich Text Editor

```json
{
  "quill": "",
  "react-quill": ""
}
```

### Drag & Drop

```json
{
  "react-dnd": "",
  "react-dnd-html5-backend": ""
}
```

### Utilities

```json
{
  "react-hot-toast": "",
  "react-helmet-async": "",
  "date-fns": "",
  "dompurify": ""
}
```

### Real-Time & Social Features

```json
{
  "socket.io-client": "",
  "react-share": "",
  "react-i18next": "",
  "i18next": "",
  "i18next-browser-languagedetector": ""
}
```

### PWA & Notifications

```json
{
  "workbox-webpack-plugin": "",
  "web-push": ""
}
```

## Server Dependencies

### Core

```json
{
  "express": "",
  "mongoose": "",
  "dotenv": ""
}
```

### Authentication

```json
{
  "bcryptjs": "",
  "jsonwebtoken": ""
}
```

### Payment Processing (Multi-Gateway)

```json
{
  "stripe": "",
  "flutterwave-node-v3": "",
  "paystack": ""
}
```

**Note:** Server-side SDKs for:
- **Stripe** - International payments
- **Flutterwave** - African payments
- **Paystack** - Nigerian & African payments

### File Upload

```json
{
  "multer": "",
  "cloudinary": ""
}
```

### Email (Optional)

```json
{
  "nodemailer": ""
}
```

### Validation & Security

```json
{
  "express-validator": "",
  "express-rate-limit": "",
  "helmet": "",
  "cors": "",
  "compression": ""
}
```

### Utilities

```json
{
  "slugify": "",
  "reading-time": "",
  "sanitize-html": ""
}
```

### Real-Time & Social Features

```json
{
  "socket.io": "",
  "node-cron": "",
  "twilio": ""
}
```

### AI & Recommendations (Optional)

```json
{
  "@tensorflow/tfjs-node": "",
  "natural": "",
  "compromise": ""
}
```

### Development

```json
{
  "nodemon": "",
  "morgan": ""
}
```

## Installation Commands

### Client Setup

```bash
cd client
npm install react react-dom react-router-dom
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install @stripe/stripe-js @stripe/react-stripe-js flutterwave-react-v3 react-paystack
npm install tailwindcss @tailwindcss/vite daisyui lucide-react
npm install react-hot-toast react-helmet-async date-fns dompurify
npm install quill react-quill
npm install react-dnd react-dnd-html5-backend
npm install socket.io-client react-share
npm install react-i18next i18next i18next-browser-languagedetector
npm install workbox-webpack-plugin web-push
npm install -D @types/node @types/react @types/react-dom
npm install -D @vitejs/plugin-react vite typescript
```

### Server Setup

```bash
cd server
npm install express mongoose dotenv
npm install bcryptjs jsonwebtoken
npm install stripe flutterwave-node-v3 paystack
npm install multer cloudinary
npm install express-validator express-rate-limit helmet cors compression
npm install slugify reading-time sanitize-html
npm install socket.io node-cron twilio
npm install -D nodemon
```

## Environment Variables

### Client (.env)

```
VITE_API_URL=http://localhost:8081/api

# Payment Gateway Public Keys
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### Server (.env)

```
PORT=8081
MONGODB_URI=mongodb://localhost:27017/ecommerce-store
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Flutterwave Configuration
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_hash

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# SMS Notifications (Twilio - Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Push Notifications (Web Push - Optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com

# AI/ML Features (Optional)
OPENAI_API_KEY=your_openai_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional - Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourstore.com

# Frontend URL
CLIENT_URL=http://localhost:5173

NODE_ENV=development
```

## Package.json Scripts

### Client

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### Server

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node src/utils/seedProducts.js"
  }
}
```

## Payment Gateway Setup

### Stripe Setup

**Test Mode Keys:**
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`

**Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Flutterwave Setup

**Test Mode Keys:**
- Public key: `FLWPUBK_TEST-...`
- Secret key: `FLWSECK_TEST-...`

**Test Cards:**
```
Success: 5531 8866 5214 2950 | CVV: 564 | PIN: 3310 | OTP: 12345
Mastercard: 5438 8980 1456 0229 | CVV: 564 | PIN: 3310 | OTP: 12345
```

**Supported Currencies:** NGN, GHS, KES, UGX, TZS, ZAR, USD, EUR, GBP

### Paystack Setup

**Test Mode Keys:**
- Public key: `pk_test_...`
- Secret key: `sk_test_...`

**Test Cards:**
```
Success: 4084 0840 8408 4081 | CVV: 408 | PIN: 0000 | OTP: 123456
Insufficient Funds: 5060 6666 6666 6666 | CVV: 123 | PIN: 1234
```

**Supported Currencies:** NGN, GHS, ZAR, USD

### Webhook URLs

Configure these webhook URLs in your payment gateway dashboards:

```
Stripe: https://yourdomain.com/api/payment/webhook/stripe
Flutterwave: https://yourdomain.com/api/payment/webhook/flutterwave
Paystack: https://yourdomain.com/api/payment/webhook/paystack
```

## Optional Dependencies

### For Advanced Features

```json
{
  "recharts": "",
  "react-csv": "",
  "pdfkit": ""
}
```

### For Testing

```json
{
  "vitest": "",
  "@testing-library/react": "",
  "supertest": ""
}
```

## DevDependencies Already in Codebase

### Client

```json
{
  "@eslint/js": "",
  "@types/node": "",
  "@types/react": "",
  "@types/react-dom": "",
  "@vitejs/plugin-react": "",
  "eslint": "",
  "eslint-plugin-react-hooks": "",
  "eslint-plugin-react-refresh": "",
  "globals": "",
  "typescript": "",
  "typescript-eslint": "",
  "vite": ""
}
```
