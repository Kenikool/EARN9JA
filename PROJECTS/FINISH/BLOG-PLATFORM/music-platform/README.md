# Music Streaming Platform

A comprehensive, next-generation music streaming platform that combines the best features of Spotify, Apple Music, TikTok, Twitch, and professional DAW software into one unified ecosystem.

## Overview

This platform is designed to revolutionize the music industry by providing:

- **Music Streaming**: High-fidelity audio streaming with offline support
- **Professional Studio**: Full DAW with AI-powered production tools
- **Live Streaming**: Real-time video/audio broadcasting with monetization
- **Short-Form Content**: TikTok-style reels with creator monetization
- **Karaoke System**: Real-time vocal processing with scoring and competitions
- **Social Features**: Communities, collaborative playlists, and activity feeds
- **ML-Powered**: Recommendations, mood detection, content moderation (no external APIs)

## Key Features

### For Listeners
- Stream 80M+ tracks with personalized recommendations
- Create and share playlists
- Follow friends and see their activity
- Karaoke with AI scoring and effects
- Discover music through mood and activity playlists
- Purchase tracks to own permanently
- Support artists with voluntary payments
- Offline downloads
- Hi-Fi lossless audio
- Spatial audio support
- Voice commands

### For Artists
- Upload and distribute music
- Professional DAW for music creation
- AI-powered production assistance
- Comprehensive analytics dashboard
- Multiple monetization streams
- Direct fan engagement
- Artist verification
- Royalty tracking and payments
- Concert and event promotion
- Limited edition releases

### For Streamers
- Live streaming up to 4K resolution
- Virtual gifts and subscriptions
- Multi-camera switching
- Custom overlays and alerts
- Real-time analytics
- Chat moderation tools
- RTMP integration
- Scheduled streams

### For Content Creators
- Create short-form video reels
- Use licensed music in content
- Monetize through views and engagement
- AI-powered editing tools
- Trending feed algorithm
- Brand sponsorships

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite 4 for build tooling
- TailwindCSS for styling
- DaisyUI v5 for components
- React Router DOM for navigation
- @tanstack/react-query for data fetching
- Zustand for state management
- Axios for HTTP requests
- React Hot Toast for notifications
- Lucide React for icons
- Socket.io-client for real-time features

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- GridFS for large file storage
- PostgreSQL for relational data
- Redis for caching
- Socket.io for WebSocket
- Cloudinary for media processing
- FFmpeg for audio/video transcoding
- Python (FastAPI) for ML services

### ML/AI
- scikit-learn for collaborative filtering
- TensorFlow/PyTorch for deep learning
- librosa for audio analysis
- BERT for NLP
- Spleeter/Demucs for stem separation

## Project Structure

```
music-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration
│   │   └── server.ts
│   └── package.json
├── ml-service/            # Python ML service
│   ├── models/            # ML models
│   ├── training/          # Training scripts
│   ├── api/               # FastAPI endpoints
│   └── requirements.txt
├── docs/                  # Documentation
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- PostgreSQL 14+
- Redis 7+
- Python 3.10+
- FFmpeg

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd music-platform
```

2. Install client dependencies
```bash
cd client
npm install
```

3. Install server dependencies
```bash
cd ../server
npm install
```

4. Install ML service dependencies
```bash
cd ../ml-service
pip install -r requirements.txt
```

5. Set up environment variables (see `.env.example` files)

6. Start development servers
```bash
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev

# Terminal 3 - ML Service
cd ml-service
python main.py
```

## User Roles

### Listener (Free/Premium/Family/Hi-Fi)
- Stream music
- Create playlists
- Social features
- Karaoke
- Offline downloads (Premium+)

### Artist
- Upload music
- Use professional studio
- View analytics
- Engage with fans
- Receive royalties

### Streamer (Free/Premium)
- Live streaming
- Monetization
- Chat management
- Analytics

### Content Creator
- Create reels
- Monetize content
- Use licensed music

### Moderator
- Review reports
- Manage content
- Moderate streams

### Admin
- Platform management
- User management
- Analytics dashboard
- System configuration

## Monetization

### Revenue Streams
- Subscriptions (Free, Premium, Family, Hi-Fi, Premium Streamer)
- Track purchases ($0.99-$2.99)
- Support purchases (voluntary)
- Virtual gifts ($0.99-$500)
- Publishing fees ($9.99/track, $29.99/album)
- Ad revenue sharing
- NFT and digital merchandise

### Revenue Splits
- Streaming: 70% artist, 30% platform
- Track Purchase: 70% artist, 30% platform
- Support: 85% artist, 15% platform
- Gifts: 70% streamer, 30% platform (75%/25% for premium)
- Reels: 55% creator, 45% platform

## Documentation

- [Requirements](../.kiro/specs/music-streaming-platform/requirements.md)
- [Design](../.kiro/specs/music-streaming-platform/design.md)
- [Dependencies](./DEPENDENCIES.md)
- [Implementation Plan](./IMPLEMENTATION-PLAN.md)

## License

Proprietary - All rights reserved

## Support

For support, email support@musicplatform.com or join our Discord community.
