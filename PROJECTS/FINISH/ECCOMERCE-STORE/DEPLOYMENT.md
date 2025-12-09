# 🚀 Deployment Guide

## Quick Start

```bash
cd deployment
chmod +x *.sh
./quick-deploy.sh
```

## Deployment Options

### 1. Vercel (Frontend) + Railway (Backend)

**Recommended for beginners**

#### Frontend (Vercel):

```bash
cd client
npm install
npm run build
npx vercel --prod
```

#### Backend (Railway):

```bash
cd server
railway login
railway init
railway up
```

### 2. Render (Full Stack)

**Recommended for simplicity**

1. Push code to GitHub
2. Connect repository to Render
3. Use `deployment/render.yaml` config
4. Set environment variables in Render dashboard

### 3. Docker (Self-Hosted)

**Recommended for full control**

```bash
cd deployment
docker-compose up -d
```

## Environment Variables

Copy and configure:

```bash
cp deployment/.env.production.example server/.env.production
```

Required variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `PAYSTACK_SECRET_KEY`
- `EMAIL_USER` & `EMAIL_PASS`
- `CLOUDINARY_*`

## Health Checks

```bash
./deployment/health-check.sh https://your-api-url.com
```

## Monitoring

```bash
./deployment/monitor.sh https://your-api-url.com
```

## Backup

```bash
./deployment/backup-database.sh
```

## Rollback

```bash
./deployment/rollback.sh
```

## CI/CD

GitHub Actions workflows included:

- `.github/workflows/test.yml` - Run tests on PR
- `.github/workflows/deploy.yml` - Auto-deploy on push

## Production Checklist

- [ ] Environment variables configured
- [ ] Database backup scheduled
- [ ] SSL certificates installed
- [ ] Payment gateway webhooks configured
- [ ] Email service configured
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] CDN configured for static assets
- [ ] Rate limiting configured
- [ ] CORS properly set

## Support

Run tests: `node server/tests/production-ready-test.js`
