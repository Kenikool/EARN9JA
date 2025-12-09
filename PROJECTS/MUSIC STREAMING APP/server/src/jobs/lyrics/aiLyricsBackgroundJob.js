import cron from 'node-cron';
import { aiLyricsGenerationService } from '../../services/lyrics/aiLyricsGenerationService.js';
import { approvalWorkflowService } from '../../services/lyrics/approvalWorkflowService.js';
import GenerationQueue from '../../models/GenerationQueue.js';
import GeneratedLyrics from '../../models/GeneratedLyrics.js';
import Song from '../../models/Song.js';
import User from '../../models/auth/User.js';

/**
 * AI Lyrics Background Job
 * Handles automated processing of lyrics generation queue and workflow management
 */
class AILyricsBackgroundJob {
  constructor() {
    this.isRunning = false;
    this.processingStats = {
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0,
      lastRun: null,
      averageProcessingTime: 0
    };
    
    // Configuration
    this.config = {
      batchSize: parseInt(process.env.LYRICS_BATCH_SIZE) || 5,
      processingInterval: process.env.LYRICS_PROCESSING_INTERVAL || '*/2 * * * *', // Every 2 minutes
      expiredCheckInterval: process.env.LYRICS_EXPIRED_CHECK_INTERVAL || '0 */6 * * *', // Every 6 hours
      maxRetries: parseInt(process.env.LYRICS_MAX_RETRIES) || 3,
      retryDelay: parseInt(process.env.LYRICS_RETRY_DELAY) || 300000, // 5 minutes
      enableAutoGeneration: process.env.LYRICS_AUTO_GENERATION !== 'false',
      autoGenerationLimit: parseInt(process.env.LYRICS_AUTO_GENERATION_LIMIT) || 10
    };
  }

  /**
   * Start the background job
   */
  start() {
    if (this.isRunning) {
      console.log('AI Lyrics background job is already running');
      return;
    }

    console.log('🎵 Starting AI Lyrics background job...');
    this.isRunning = true;

    // Main processing job - process queue items
    this.processingJob = cron.schedule(this.config.processingInterval, async () => {
      await this.processQueue();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Expired approvals cleanup job
    this.expiredJob = cron.schedule(this.config.expiredCheckInterval, async () => {
      await this.processExpiredApprovals();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Auto-generation job for songs without lyrics
    if (this.config.enableAutoGeneration) {
      this.autoGenerationJob = cron.schedule('0 2 * * *', async () => { // Daily at 2 AM
        await this.autoGenerateLyricsForSongs();
      }, {
        scheduled: true,
        timezone: 'UTC'
      });
    }

    console.log('✅ AI Lyrics background job started successfully');
    console.log(`📊 Configuration:`, {
      batchSize: this.config.batchSize,
      processingInterval: this.config.processingInterval,
      autoGeneration: this.config.enableAutoGeneration
    });
  }

  /**
   * Stop the background job
   */
  stop() {
    if (!this.isRunning) {
      console.log('AI Lyrics background job is not running');
      return;
    }

    console.log('🛑 Stopping AI Lyrics background job...');
    
    if (this.processingJob) {
      this.processingJob.stop();
      this.processingJob.destroy();
    }
    
    if (this.expiredJob) {
      this.expiredJob.stop();
      this.expiredJob.destroy();
    }
    
    if (this.autoGenerationJob) {
      this.autoGenerationJob.stop();
      this.autoGenerationJob.destroy();
    }

    this.isRunning = false;
    console.log('✅ AI Lyrics background job stopped');
  }

  /**
   * Process the lyrics generation queue
   */
  async processQueue() {
    if (!this.isRunning) return;

    const startTime = Date.now();
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('🔄 Processing AI lyrics generation queue...');

      // Get pending queue items with priority ordering
      const queueItems = await GenerationQueue.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() },
        retryCount: { $lt: this.config.maxRetries }
      })
      .sort({ priority: -1, createdAt: 1 })
      .limit(this.config.batchSize)
      .populate('songId', 'title artist genre duration audioUrl')
      .populate('artistId', 'name email preferences');

      if (queueItems.length === 0) {
        console.log('📭 No pending lyrics generation items found');
        return;
      }

      console.log(`📝 Processing ${queueItems.length} lyrics generation items`);

      // Process each queue item
      for (const queueItem of queueItems) {
        try {
          processedCount++;
          await this.processQueueItem(queueItem);
          successCount++;
          console.log(`✅ Successfully processed lyrics for song: ${queueItem.songId.title}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to process lyrics for song: ${queueItem.songId.title}`, error);
          await this.handleProcessingError(queueItem, error);
        }
      }

      // Update statistics
      const processingTime = Date.now() - startTime;
      this.updateStats(processedCount, successCount, errorCount, processingTime);

      console.log(`📊 Queue processing complete: ${successCount} success, ${errorCount} errors in ${processingTime}ms`);

    } catch (error) {
      console.error('❌ Error in queue processing:', error);
    }
  }

  /**
   * Process a single queue item
   */
  async processQueueItem(queueItem) {
    try {
      // Update queue item status to processing
      queueItem.status = 'processing';
      queueItem.processingStartedAt = new Date();
      await queueItem.save();

      // Generate lyrics using the AI service
      const generationResult = await aiLyricsGenerationService.generateLyrics(
        queueItem.songId._id,
        queueItem.artistId._id,
        {
          preferences: queueItem.metadata.preferences || {},
          priority: queueItem.priority,
          source: 'background-job'
        }
      );

      // Initialize approval workflow
      await approvalWorkflowService.initializeWorkflow(
        generationResult._id,
        queueItem.artistId._id,
        {
          initiatedBy: 'system',
          source: 'background-processing',
          priority: queueItem.priority >= 100 ? 'high' : 'normal'
        }
      );

      // Update queue item as completed
      queueItem.status = 'completed';
      queueItem.completedAt = new Date();
      queueItem.generatedLyricsId = generationResult._id;
      queueItem.processingTime = Date.now() - queueItem.processingStartedAt.getTime();
      await queueItem.save();

      return generationResult;

    } catch (error) {
      // Update queue item status to failed
      queueItem.status = 'failed';
      queueItem.errorMessage = error.message;
      queueItem.lastAttemptAt = new Date();
      await queueItem.save();
      
      throw error;
    }
  }

  /**
   * Handle processing errors with retry logic
   */
  async handleProcessingError(queueItem, error) {
    try {
      queueItem.retryCount = (queueItem.retryCount || 0) + 1;
      queueItem.lastError = error.message;
      queueItem.lastAttemptAt = new Date();

      if (queueItem.retryCount >= this.config.maxRetries) {
        // Max retries reached, mark as failed
        queueItem.status = 'failed';
        queueItem.failedAt = new Date();
        
        console.log(`❌ Max retries reached for song: ${queueItem.songId.title}`);
        
        // Optionally notify the artist about the failure
        await this.notifyArtistOfFailure(queueItem, error);
      } else {
        // Schedule for retry with exponential backoff
        const retryDelay = this.config.retryDelay * Math.pow(2, queueItem.retryCount - 1);
        queueItem.scheduledFor = new Date(Date.now() + retryDelay);
        queueItem.status = 'pending';
        
        console.log(`🔄 Scheduling retry ${queueItem.retryCount}/${this.config.maxRetries} for song: ${queueItem.songId.title} in ${retryDelay/1000}s`);
      }

      await queueItem.save();
    } catch (saveError) {
      console.error('Error updating queue item after failure:', saveError);
    }
  }

  /**
   * Process expired approval workflows
   */
  async processExpiredApprovals() {
    try {
      console.log('🕐 Checking for expired approval workflows...');
      
      const expiredCount = await approvalWorkflowService.processExpiredApprovals();
      
      if (expiredCount > 0) {
        console.log(`⏰ Processed ${expiredCount} expired approval workflows`);
      } else {
        console.log('✅ No expired approval workflows found');
      }
    } catch (error) {
      console.error('❌ Error processing expired approvals:', error);
    }
  }

  /**
   * Auto-generate lyrics for songs without lyrics
   */
  async autoGenerateLyricsForSongs() {
    if (!this.config.enableAutoGeneration) return;

    try {
      console.log('🤖 Starting auto-generation for songs without lyrics...');

      // Find songs without lyrics from artists who have auto-generation enabled
      const songsWithoutLyrics = await Song.aggregate([
        {
          $lookup: {
            from: 'lyrics',
            localField: '_id',
            foreignField: 'songId',
            as: 'lyrics'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'artist',
            foreignField: '_id',
            as: 'artistInfo'
          }
        },
        {
          $match: {
            lyrics: { $size: 0 }, // No lyrics
            'artistInfo.preferences.aiLyricsGeneration': { $ne: false }, // Auto-generation enabled
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Created in last 7 days
          }
        },
        {
          $limit: this.config.autoGenerationLimit
        },
        {
          $project: {
            _id: 1,
            title: 1,
            artist: 1,
            genre: 1,
            duration: 1,
            'artistInfo.preferences': 1
          }
        }
      ]);

      if (songsWithoutLyrics.length === 0) {
        console.log('📭 No songs found for auto-generation');
        return;
      }

      console.log(`🎵 Found ${songsWithoutLyrics.length} songs for auto-generation`);

      let generatedCount = 0;
      for (const song of songsWithoutLyrics) {
        try {
          // Check if already in queue
          const existingQueueItem = await GenerationQueue.findOne({
            songId: song._id,
            status: { $in: ['pending', 'processing'] }
          });

          if (existingQueueItem) {
            console.log(`⏭️  Song ${song.title} already in queue, skipping`);
            continue;
          }

          // Add to generation queue with low priority
          await aiLyricsGenerationService.addToQueue(song._id, song.artist, {
            queueType: 'auto-generation',
            priority: 10, // Low priority for auto-generation
            metadata: {
              preferences: song.artistInfo[0]?.preferences?.lyricsPreferences || {},
              autoGenerated: true
            },
            requestedBy: 'system',
            requestSource: 'auto-generation'
          });

          generatedCount++;
          console.log(`✅ Added ${song.title} to auto-generation queue`);

        } catch (error) {
          console.error(`❌ Failed to add ${song.title} to queue:`, error);
        }
      }

      console.log(`🤖 Auto-generation complete: ${generatedCount} songs added to queue`);

    } catch (error) {
      console.error('❌ Error in auto-generation process:', error);
    }
  }

  /**
   * Notify artist of generation failure
   */
  async notifyArtistOfFailure(queueItem, error) {
    try {
      const artist = queueItem.artistId;
      if (!artist || !artist.email) return;

      // Send notification about the failure
      const notificationService = (await import('../../services/notification/notificationService.js')).default;
      
      await notificationService.sendNotification(artist._id, {
        type: 'lyrics_generation_failed',
        title: 'Lyrics Generation Failed',
        message: `We couldn't generate lyrics for "${queueItem.songId.title}". You can try again or add lyrics manually.`,
        data: {
          songId: queueItem.songId._id,
          songTitle: queueItem.songId.title,
          error: error.message,
          retryCount: queueItem.retryCount
        }
      });

    } catch (notificationError) {
      console.error('Error sending failure notification:', notificationError);
    }
  }

  /**
   * Update processing statistics
   */
  updateStats(processed, success, errors, processingTime) {
    this.processingStats.totalProcessed += processed;
    this.processingStats.successCount += success;
    this.processingStats.errorCount += errors;
    this.processingStats.lastRun = new Date();
    
    // Calculate average processing time
    if (processed > 0) {
      const currentAvg = this.processingStats.averageProcessingTime;
      const totalRuns = this.processingStats.totalProcessed;
      this.processingStats.averageProcessingTime = 
        ((currentAvg * (totalRuns - processed)) + processingTime) / totalRuns;
    }
  }

  /**
   * Get job statistics
   */
  getStats() {
    return {
      ...this.processingStats,
      isRunning: this.isRunning,
      config: this.config
    };
  }

  /**
   * Get queue status
   */
  async getQueueStatus() {
    try {
      const stats = await GenerationQueue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProcessingTime: { $avg: '$processingTime' }
          }
        }
      ]);

      const result = {
        total: 0,
        byStatus: {},
        avgProcessingTime: 0
      };

      stats.forEach(stat => {
        result.byStatus[stat._id] = {
          count: stat.count,
          avgProcessingTime: stat.avgProcessingTime || 0
        };
        result.total += stat.count;
      });

      return result;
    } catch (error) {
      console.error('Error getting queue status:', error);
      return { total: 0, byStatus: {}, avgProcessingTime: 0 };
    }
  }

  /**
   * Manually trigger queue processing (for testing/admin)
   */
  async triggerProcessing() {
    if (!this.isRunning) {
      throw new Error('Background job is not running');
    }

    console.log('🔧 Manually triggering queue processing...');
    await this.processQueue();
  }

  /**
   * Clear failed queue items older than specified days
   */
  async clearOldFailedItems(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await GenerationQueue.deleteMany({
        status: 'failed',
        failedAt: { $lt: cutoffDate }
      });

      console.log(`🧹 Cleared ${result.deletedCount} old failed queue items`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error clearing old failed items:', error);
      throw error;
    }
  }
}

// Create singleton instance
const aiLyricsBackgroundJob = new AILyricsBackgroundJob();

// Auto-start if not in test environment
if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_BACKGROUND_JOBS !== 'true') {
  // Start with a small delay to ensure all services are initialized
  setTimeout(() => {
    aiLyricsBackgroundJob.start();
  }, 5000);
}

export default aiLyricsBackgroundJob;