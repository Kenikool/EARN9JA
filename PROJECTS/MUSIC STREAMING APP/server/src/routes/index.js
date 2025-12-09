 soics d// Feature-based route exports
// This file provides centralized access to all routes organized by domain

import express from 'express';

const router = express.Router();

// Auth Routes
import authRoutes from './auth/auth.js';
import subscriptionRoutes from './auth/subscriptions.js';
import oauthRoutes from './auth/oauth.js';
import paymentWebhookRoutes from './payment/webhooks.js';

// Integration Routes
import webhookRoutes from './webhooks.js';
import integrationRoutes from './integrations.js';

// Content Routes
import songRoutes from './content/songs.js';
import albumRoutes from './content/albums.js';
import artistRoutes from './content/artists.js';
import playlistRoutes from './content/playlists.js';
import lyricsRoutes from './content/lyrics.js';
import smartPlaylistRoutes from './content/smartPlaylists.js';

// Artist Routes
import artistVerificationRoutes from './artist/verification.js';

// Social Routes
import commentRoutes from './social/comments.js';
import socialRoutes from './social/social.js';
import notificationRoutes from './social/notifications.js';
import friendsRoutes from './social/friends.js';

// Analytics Routes
import analyticsRoutes from './analytics/analytics.js';
import legacyAdminRoutes from './analytics/admin.js';
import reportRoutes from './analytics/reports.js';
import listeningAnalyticsRoutes from './analytics/listeningAnalytics.js';

// Admin Routes (New 2025 System)
import adminRoutes from './admin/admin.js';

// Moderator Routes (2025 System)
import moderatorRoutes from './moderator/moderator.js';

// AI Routes
import aiRoutes from './ai/ai.js';
import aiTestRoutes from './ai/test.js';

// Streaming Routes
import queueRoutes from './streaming/queue.js';
import radioRoutes from './streaming/radio.js';
import realtimeRoutes from './streaming/realtime.js';
import liveRoutes from './streaming/live.js';

// Core Routes
import searchRoutes from './core/search.js';
import downloadRoutes from './download/downloads.js';
import historyRoutes from './core/history.js';

// Ad Routes
import adRoutes from './ad/ads.js';

// User Routes
import audioSettingsRoutes from './user/audioSettings.js';
import usersRoutes from './users/users.js';

// Discovery Routes
import moodDetectionRoutes from './discovery/moodDetection.js';
import activityPlaylistRoutes from './discovery/activityPlaylists.js';

// Debug Routes (development only)
import debugRoutes from './debug/debug.js';
import tokenDebugRoutes from './debug/tokenDebug.js';
import artistTestingRoutes from './debug/artistTesting.js';

// Mount routes with appropriate prefixes
// Auth
router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/payment/webhooks', paymentWebhookRoutes);

// Integrations
router.use('/webhooks', webhookRoutes);
router.use('/integrations', integrationRoutes);

// Content
router.use('/songs', songRoutes);
router.use('/albums', albumRoutes);
router.use('/artists', artistRoutes);
router.use('/playlists', playlistRoutes);
router.use('/lyrics', lyricsRoutes);
router.use('/smart-playlists', smartPlaylistRoutes);

// Artist
router.use('/artist/verification', artistVerificationRoutes);

// Social
router.use('/comments', commentRoutes);
router.use('/social', socialRoutes);
router.use('/notifications', notificationRoutes);
router.use('/friends', friendsRoutes);

// Analytics
router.use('/analytics', analyticsRoutes);
router.use('/admin/legacy', legacyAdminRoutes); // Legacy admin routes
router.use('/reports', reportRoutes);
router.use('/analytics/listening', listeningAnalyticsRoutes);

// Admin (New 2025 System)
router.use('/admin', adminRoutes);

// Moderator (2025 System)
router.use('/moderator', moderatorRoutes);

// AI
router.use('/ai', aiRoutes);
router.use('/ai', aiTestRoutes); // lightweight ML connectivity tests

// Streaming
router.use('/queue', queueRoutes);
router.use('/radio', radioRoutes);
router.use('/realtime', realtimeRoutes);
router.use('/live', liveRoutes);

// Core
router.use('/search', searchRoutes);
router.use('/downloads', downloadRoutes);
router.use('/history', historyRoutes);

// Ads
router.use('/ads', adRoutes);

// User
router.use('/user/audio-settings', audioSettingsRoutes);
router.use('/users', usersRoutes);

// Discovery
router.use('/discovery/mood', moodDetectionRoutes);
router.use('/discovery/activity-playlists', activityPlaylistRoutes);

// Debug (development only)
if (process.env.NODE_ENV === 'development') {
  router.use('/debug', debugRoutes);
  router.use('/debug/tokens', tokenDebugRoutes);
  router.use('/debug/artist-testing', artistTestingRoutes);
}

export default router;