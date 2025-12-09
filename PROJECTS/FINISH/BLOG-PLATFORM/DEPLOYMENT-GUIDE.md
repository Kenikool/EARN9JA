# Blog Platform - Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database backup created
- [ ] Cloudinary account set up
- [ ] MongoDB Atlas account set up
- [ ] Domain name ready (optional)

---

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier)

### 2. Configure Database Access
1. Go to "Database Access"
2. Add a new database user
3. Set username and password (save these!)
4. Grant "Read and write to any database" permission

### 3. Configure Network Access
1. Go to "Network Access"
2. Add IP Address
3. Allow access from anywhere: `0.0.0.0/0` (for development)
4. For production, add specific IP addresses

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name (e.g., `blog-platform`)

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/blog-platform?retryWrites=true&w=majority`

---

## 📦 Backend Deployment (Render/Railway/Heroku)

### Option 1: Deploy to Render

#### 1. Prepare Backend
```bash
cd server
# Ensure package.json has start script
# "start": "node src/server.js"
```

#### 2. Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub

#### 3. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** blog-platform-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free

#### 4. Add Environment Variables
```
NODE_ENV=production
PORT=8081
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 5. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your API URL: `https://blog-platform-api.onrender.com`

---

### Option 2: Deploy to Railway

#### 1. Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub

#### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

#### 3. Configure Service
1. Select the server directory as root
2. Add environment variables (same as above)
3. Railway will auto-detect Node.js and deploy

---

## 🎨 Frontend Deployment (Vercel/Netlify)

### Option 1: Deploy to Vercel

#### 1. Prepare Frontend
```bash
cd client
# Update API base URL in src/services/api.ts
# Change to your deployed backend URL
```

Update `client/src/services/api.ts`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://blog-platform-api.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

#### 2. Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub

#### 3. Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

#### 4. Add Environment Variables
```
VITE_API_URL=https://blog-platform-api.onrender.com/api
```

#### 5. Deploy
- Click "Deploy"
- Wait for deployment
- Your site will be live at: `https://your-project.vercel.app`

---

### Option 2: Deploy to Netlify

#### 1. Create Netlify Account
1. Go to [Netlify](https://www.netlify.com)
2. Sign up with GitHub

#### 2. Create New Site
1. Click "Add new site" → "Import an existing project"
2. Connect to GitHub
3. Select your repository
4. Configure:
   - **Base directory:** client
   - **Build command:** `npm run build`
   - **Publish directory:** client/dist

#### 3. Add Environment Variables
Go to Site settings → Environment variables:
```
VITE_API_URL=https://blog-platform-api.onrender.com/api
```

#### 4. Deploy
- Click "Deploy site"
- Your site will be live at: `https://your-site.netlify.app`

---

## ☁️ Cloudinary Setup

### 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account

### 2. Get API Credentials
1. Go to Dashboard
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Create Upload Presets (Optional)
1. Go to Settings → Upload
2. Create upload preset for blog images
3. Set folder structure

---

## 🔒 Security Configuration

### 1. Update CORS Settings
In `server/src/server.js`, update CORS to allow your frontend domain:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://your-site.vercel.app",
    "https://your-site.netlify.app"
  ],
  credentials: true,
};

app.use(cors(corsOptions));
```

### 2. Secure Environment Variables
- Never commit `.env` files
- Use platform-specific environment variable management
- Rotate secrets regularly

### 3. Enable HTTPS
- Both Render and Vercel provide HTTPS automatically
- Ensure all API calls use HTTPS in production

---

## 🧪 Post-Deployment Testing

### 1. Test Backend API
```bash
# Test health endpoint
curl https://blog-platform-api.onrender.com/

# Test auth endpoint
curl -X POST https://blog-platform-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'
```

### 2. Test Frontend
1. Visit your deployed frontend URL
2. Test user registration
3. Test user login
4. Test creating a post
5. Test image upload
6. Test all major features

### 3. Monitor Logs
- **Render:** Check logs in dashboard
- **Vercel:** Check function logs
- **MongoDB Atlas:** Monitor database metrics

---

## 📊 Monitoring & Maintenance

### 1. Set Up Monitoring
- Use Render/Railway built-in monitoring
- Set up uptime monitoring (e.g., UptimeRobot)
- Monitor database performance in MongoDB Atlas

### 2. Regular Backups
- MongoDB Atlas provides automatic backups
- Export important data regularly
- Keep backup of environment variables

### 3. Updates
```bash
# Update dependencies regularly
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

---

## 🌐 Custom Domain (Optional)

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Render:
1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records

---

## 🐛 Troubleshooting

### Backend Issues
- **500 Error:** Check environment variables
- **Database Connection:** Verify MongoDB URI
- **CORS Error:** Update CORS settings

### Frontend Issues
- **API Not Found:** Check VITE_API_URL
- **Build Fails:** Check Node version compatibility
- **Images Not Loading:** Verify Cloudinary credentials

### Common Fixes
```bash
# Clear build cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📝 Deployment Checklist

- [ ] MongoDB Atlas configured
- [ ] Cloudinary account set up
- [ ] Backend deployed to Render/Railway
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled
- [ ] Post-deployment tests passed
- [ ] Monitoring set up
- [ ] Documentation updated

---

## 🎉 Your Blog Platform is Live!

**Backend API:** `https://your-api-url.com`  
**Frontend:** `https://your-site-url.com`  
**Database:** MongoDB Atlas  
**Images:** Cloudinary

---

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
