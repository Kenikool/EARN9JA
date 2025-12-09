import GeneratedLyrics from '../../models/GeneratedLyrics.js';
import mongoose from 'mongoose';

class FeedbackCollectionService {
  /**
   * Aggregate feedback from artist approvals
   */
  async aggregateArtistFeedback(options = {}) {
    const { startDate, endDate, artistId } = options;

    const matchStage = {
      'approvalWorkflow.status': { $in: ['approved', 'rejected', 'modified'] }
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    if (artistId) {
      matchStage['approvalWorkflow.artistId'] = new mongoose.Types.ObjectId(artistId);
    }

    const aggregation = await GeneratedLyrics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$approvalWorkflow.status',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$generationMetadata.confidence' },
          avgProcessingTime: { $avg: '$generationMetadata.processingTime' },
          lyrics: { $push: '$$ROOT' }
        }
      }
    ]);

    const summary = {
      total: 0,
      approved: 0,
      rejected: 0,
      modified: 0,
      approvalRate: 0,
      avgConfidence: 0,
      avgProcessingTime: 0
    };

    aggregation.forEach(group => {
      summary.total += group.count;
      summary[group._id] = group.count;
      summary.avgConfidence += group.avgConfidence * group.count;
      summary.avgProcessingTime += group.avgProcessingTime * group.count;
    });

    if (summary.total > 0) {
      summary.approvalRate = (summary.approved / summary.total) * 100;
      summary.avgConfidence /= summary.total;
      summary.avgProcessingTime /= summary.total;
    }

    return {
      summary,
      details: aggregation
    };
  }

  /**
   * Track user interaction with generated lyrics
   */
  async trackUserInteraction(generatedLyricsId, interactionType, userId, metadata = {}) {
    const generatedLyrics = await GeneratedLyrics.findById(generatedLyricsId);

    if (!generatedLyrics) {
      throw new Error('Generated lyrics not found');
    }

    if (!generatedLyrics.userInteractions) {
      generatedLyrics.userInteractions = [];
    }

    generatedLyrics.userInteractions.push({
      userId,
      interactionType, // 'view', 'like', 'dislike', 'share', 'report'
      timestamp: new Date(),
      metadata
    });

    await generatedLyrics.save();

    return generatedLyrics;
  }

  /**
   * Calculate quality score based on engagement metrics
   */
  async calculateQualityScore(generatedLyricsId) {
    const generatedLyrics = await GeneratedLyrics.findById(generatedLyricsId);

    if (!generatedLyrics) {
      throw new Error('Generated lyrics not found');
    }

    let qualityScore = 0;
    let weights = {
      confidence: 0.3,
      approval: 0.4,
      userFeedback: 0.2,
      engagement: 0.1
    };

    // Confidence score from generation
    const confidenceScore = (generatedLyrics.generationMetadata?.confidence || 0) * 100;
    qualityScore += confidenceScore * weights.confidence;

    // Approval status
    let approvalScore = 0;
    if (generatedLyrics.approvalWorkflow?.status === 'approved') {
      approvalScore = 100;
    } else if (generatedLyrics.approvalWorkflow?.status === 'modified') {
      approvalScore = 70;
    } else if (generatedLyrics.approvalWorkflow?.status === 'rejected') {
      approvalScore = 0;
    } else {
      approvalScore = 50; // Pending
    }
    qualityScore += approvalScore * weights.approval;

    // User feedback (likes vs dislikes)
    if (generatedLyrics.userFeedback && generatedLyrics.userFeedback.length > 0) {
      const likes = generatedLyrics.userFeedback.filter(f => f.feedback === 'like').length;
      const dislikes = generatedLyrics.userFeedback.filter(f => f.feedback === 'dislike').length;
      const total = likes + dislikes;
      const feedbackScore = total > 0 ? (likes / total) * 100 : 50;
      qualityScore += feedbackScore * weights.userFeedback;
    } else {
      qualityScore += 50 * weights.userFeedback; // Neutral if no feedback
    }

    // Engagement metrics
    if (generatedLyrics.userInteractions && generatedLyrics.userInteractions.length > 0) {
      const views = generatedLyrics.userInteractions.filter(i => i.interactionType === 'view').length;
      const positiveActions = generatedLyrics.userInteractions.filter(
        i => ['like', 'share'].includes(i.interactionType)
      ).length;
      const engagementScore = views > 0 ? Math.min((positiveActions / views) * 100, 100) : 0;
      qualityScore += engagementScore * weights.engagement;
    } else {
      qualityScore += 0 * weights.engagement;
    }

    // Update the quality score in the document
    generatedLyrics.qualityMetrics = {
      overallScore: Math.round(qualityScore),
      confidenceScore: Math.round(confidenceScore),
      approvalScore: Math.round(approvalScore),
      calculatedAt: new Date()
    };

    await generatedLyrics.save();

    return generatedLyrics.qualityMetrics;
  }

  /**
   * Get feedback analytics for a time period
   */
  async getFeedbackAnalytics(options = {}) {
    const { startDate, endDate, groupBy = 'day' } = options;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    let dateGrouping;
    switch (groupBy) {
      case 'hour':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'day':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        dateGrouping = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const analytics = await GeneratedLyrics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateGrouping,
          totalGenerated: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$approvalWorkflow.status', 'approved'] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$approvalWorkflow.status', 'rejected'] }, 1, 0]
            }
          },
          modified: {
            $sum: {
              $cond: [{ $eq: ['$approvalWorkflow.status', 'modified'] }, 1, 0]
            }
          },
          avgConfidence: { $avg: '$generationMetadata.confidence' },
          avgProcessingTime: { $avg: '$generationMetadata.processingTime' },
          totalLikes: { $sum: { $size: { $ifNull: ['$userFeedback', []] } } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    return analytics;
  }

  /**
   * Identify patterns in successful vs failed generations
   */
  async identifySuccessPatterns() {
    const successfulLyrics = await GeneratedLyrics.find({
      'approvalWorkflow.status': 'approved',
      'generationMetadata.confidence': { $gte: 0.7 }
    }).limit(100);

    const failedLyrics = await GeneratedLyrics.find({
      'approvalWorkflow.status': 'rejected'
    }).limit(100);

    const patterns = {
      successful: {
        avgConfidence: 0,
        avgLength: 0,
        commonGenres: {},
        commonMoods: {},
        avgProcessingTime: 0
      },
      failed: {
        avgConfidence: 0,
        avgLength: 0,
        commonGenres: {},
        commonMoods: {},
        avgProcessingTime: 0
      }
    };

    // Analyze successful patterns
    if (successfulLyrics.length > 0) {
      successfulLyrics.forEach(lyrics => {
        patterns.successful.avgConfidence += lyrics.generationMetadata?.confidence || 0;
        patterns.successful.avgLength += lyrics.content?.length || 0;
        patterns.successful.avgProcessingTime += lyrics.generationMetadata?.processingTime || 0;

        // Track genres and moods
        const genre = lyrics.generationMetadata?.genre;
        const mood = lyrics.generationMetadata?.mood;
        if (genre) patterns.successful.commonGenres[genre] = (patterns.successful.commonGenres[genre] || 0) + 1;
        if (mood) patterns.successful.commonMoods[mood] = (patterns.successful.commonMoods[mood] || 0) + 1;
      });

      patterns.successful.avgConfidence /= successfulLyrics.length;
      patterns.successful.avgLength /= successfulLyrics.length;
      patterns.successful.avgProcessingTime /= successfulLyrics.length;
    }

    // Analyze failed patterns
    if (failedLyrics.length > 0) {
      failedLyrics.forEach(lyrics => {
        patterns.failed.avgConfidence += lyrics.generationMetadata?.confidence || 0;
        patterns.failed.avgLength += lyrics.content?.length || 0;
        patterns.failed.avgProcessingTime += lyrics.generationMetadata?.processingTime || 0;

        const genre = lyrics.generationMetadata?.genre;
        const mood = lyrics.generationMetadata?.mood;
        if (genre) patterns.failed.commonGenres[genre] = (patterns.failed.commonGenres[genre] || 0) + 1;
        if (mood) patterns.failed.commonMoods[mood] = (patterns.failed.commonMoods[mood] || 0) + 1;
      });

      patterns.failed.avgConfidence /= failedLyrics.length;
      patterns.failed.avgLength /= failedLyrics.length;
      patterns.failed.avgProcessingTime /= failedLyrics.length;
    }

    return patterns;
  }

  /**
   * Export training data for model improvement
   */
  async exportTrainingData(options = {}) {
    const { minQualityScore = 70, limit = 1000 } = options;

    const trainingData = await GeneratedLyrics.find({
      'approvalWorkflow.status': 'approved',
      'qualityMetrics.overallScore': { $gte: minQualityScore }
    })
      .limit(limit)
      .select('content songId generationMetadata qualityMetrics approvalWorkflow')
      .lean();

    return trainingData.map(item => ({
      input: {
        songId: item.songId,
        genre: item.generationMetadata?.genre,
        mood: item.generationMetadata?.mood,
        prompt: item.generationMetadata?.prompt
      },
      output: item.content,
      quality: item.qualityMetrics?.overallScore,
      metadata: {
        confidence: item.generationMetadata?.confidence,
        processingTime: item.generationMetadata?.processingTime,
        approvalDate: item.approvalWorkflow?.approvedAt
      }
    }));
  }
}

export default new FeedbackCollectionService();
