# Music Platform - Dependencies

## ✅ Client Dependencies

### Core

```json
{
  "react": "latest",
  "react-dom": "latest",
  "react-router-dom": "latest",
  "typescript": "latest"
}
```

### Build Tool

```json
{
  "vite": "latest",
  "@vitejs/plugin-react": "latest"
}
```

### State Management

```json
{
  "@tanstack/react-query": "latest",
  "zustand": "latest"
}
```

### UI & Styling

```json
{
  "tailwindcss": "latest",
  "@tailwindcss/vite": "latest",
  "daisyui": "latest",
  "lucide-react": "latest"
}
```

### HTTP & Real-time

```json
{
  "axios": "latest",
  "socket.io-client": "latest"
}
```

### Notifications

```json
{
  "react-hot-toast": "latest"
}
```

### Forms & Validation

```json
{
  "react-hook-form": "latest",
  "zod": "latest",
  "@hookform/resolvers": "latest"
}
```

### Audio & Media

```json
{
  "howler": "latest",
  "wavesurfer.js": "latest",
  "react-player": "latest",
  "tone": "latest"
}
```

### Utilities

```json
{
  "date-fns": "latest",
  "dompurify": "latest",
  "react-helmet-async": "latest",
  "clsx": "latest",
  "nanoid": "latest"
}
```

### Media Upload

```json
{
  "cloudinary-react": "latest"
}
```

### Dev Dependencies

```json
{
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "@types/node": "latest",
  "@types/dompurify": "latest",
  "eslint": "latest",
  "typescript-eslint": "latest",
  "eslint-plugin-react-hooks": "latest",
  "eslint-plugin-react-refresh": "latest"
}
```

---

## ✅ Server Dependencies

### Core

```json
{
  "express": "latest",
  "dotenv": "latest",
  "cors": "latest"
}
```

### Database

```json
{
  "mongoose": "latest",
  "pg": "latest",
  "redis": "latest",
  "ioredis": "latest"
}
```

### Authentication & Security

```json
{
  "bcryptjs": "latest",
  "jsonwebtoken": "latest",
  "helmet": "latest",
  "express-rate-limit": "latest",
  "express-validator": "latest"
}
```

### File Upload & Processing

```json
{
  "multer": "latest",
  "gridfs-stream": "latest",
  "multer-gridfs-storage": "latest",
  "cloudinary": "latest",
  "fluent-ffmpeg": "latest",
  "sharp": "latest"
}
```

### Real-time

```json
{
  "socket.io": "latest"
}
```

### Audio Processing

```json
{
  "music-metadata": "latest",
  "node-id3": "latest"
}
```

### Job Queue

```json
{
  "bull": "latest",
  "bullmq": "latest"
}
```

### Utilities

```json
{
  "compression": "latest",
  "morgan": "latest",
  "winston": "latest",
  "slugify": "latest",
  "reading-time": "latest",
  "sanitize-html": "latest",
  "uuid": "latest",
  "lodash": "latest",
  "dayjs": "latest"
}
```

### Payment Processing

```json
{
  "stripe": "latest",
  "paypal-rest-sdk": "latest"
}
```

### Email

```json
{
  "nodemailer": "latest",
  "@sendgrid/mail": "latest"
}
```

### Search

```json
{
  "@elastic/elasticsearch": "latest"
}
```

### Dev Dependencies

```json
{
  "nodemon": "latest",
  "@types/express": "latest",
  "@types/node": "latest",
  "@types/bcryptjs": "latest",
  "@types/jsonwebtoken": "latest",
  "@types/multer": "latest",
  "@types/cors": "latest",
  "prettier": "latest"
}
```

---

## ✅ ML Service Dependencies (Python)

### Core

```txt
fastapi
uvicorn[standard]
pydantic
pydantic-settings
python-dotenv
```

### Machine Learning

```txt
scikit-learn
tensorflow
torch
torchvision
torchaudio
transformers
```

### Audio Processing

```txt
librosa
soundfile
pydub
spleeter
demucs
```

### NLP

```txt
nltk
spacy
sentence-transformers
```

### Computer Vision

```txt
opencv-python
pillow
```

### Data Processing

```txt
numpy
pandas
scipy
```

### Database

```txt
pymongo
psycopg2-binary
redis
```

### Utilities

```txt
requests
```

### Model Serving

```txt
onnxruntime
tensorflow-serving-api
```

### Dev Dependencies

```txt
pytest
black
flake8
mypy
```

---

## 📋 Installation Commands

### Client Setup

```bash
cd music-platform/client
npm install
```

### Server Setup

```bash
cd music-platform/server
npm install
```

### ML Service Setup

```bash
cd music-platform/ml-service
pip install -r requirements.txt
```

---

## 🌍 Environment Variables

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Server (.env)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/music-platform

# PostgreSQL
POSTGRES_URI=postgresql://user:password@localhost:5432/music-platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=90d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# GridFS
GRIDFS_BUCKET_NAME=audio_files

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Email
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@musicplatform.com

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
```

### ML Service (.env)

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/music-platform
REDIS_URL=redis://localhost:6379
MODEL_PATH=./models
```

---

## 📝 Notes

- All dependencies will be installed with their latest compatible versions
- **TailwindCSS v4** and **DaisyUI v5** are specifically required as per project requirements
- Python 3.10+ is required for ML service
- **FFmpeg** must be installed system-wide for audio/video processing
- MongoDB, PostgreSQL, and Redis must be running locally or accessible via connection strings
- **GridFS** is used for storing large audio files in MongoDB
- **Cloudinary** is used for image processing and CDN delivery
- **Elasticsearch** is optional but recommended for advanced search features

---

## ✅ System Requirements

### Required Software

- Node.js 18+
- Python 3.10+
- MongoDB 6+
- PostgreSQL 14+
- Redis 7+
- FFmpeg (system-wide installation)

### Optional

- Docker & Docker Compose (for containerized development)
- Elasticsearch 8+ (for advanced search)
- CUDA (for GPU-accelerated ML training)
- Kubernetes (for production deployment)
