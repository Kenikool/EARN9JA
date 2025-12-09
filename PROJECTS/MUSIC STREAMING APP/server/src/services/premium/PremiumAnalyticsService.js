import User from '../../models/auth/User.js';
import Subscription from '../../models/auth/Subscription.js';
import ListeningHistory from '../../models/recommendations/ListeningHistory.js';
import Song from '../../models/music/Song.js';
import Artist from '../../models/music/Artist.js';
import Album from '../../models/music/Album.js';
import logger from '../../utils/logger.js';

class PremiumAnalyticsService {
  async getComprehensiveAnalytics(userId, timeframe = 'month') {
    try {
      const user = await User.findById(userId).populate('subscription');
      const hasAdvanced = !!(user && user.subscription && user.subscription.plan?.features?.advancedAnalytics);
      if (!hasAdvanced) {
        throw new Error('Advanced analytics not available');
      }

      const analytics = {
        listeningTime: await this.getListeningTimeAnalytics(userId, timeframe),
        topGenres: await this.getTopGenresAnalytics(userId, timeframe),
        topArtists: await this.getTopArtistsAnalytics(userId, timeframe),
        topSongs: await this.getTopSongsAnalytics(userId, timeframe),
        discoveries: await this.getDiscoveryAnalytics(userId, timeframe),
        listeningPatterns: await this.getListeningPatternsAnalytics(userId, timeframe),
        audioFeatures: await this.getAudioFeaturesAnalytics(userId, timeframe),
        deviceUsage: await this.getDeviceUsageAnalytics(userId, timeframe),
        skipAnalytics: await this.getSkipAnalytics(userId, timeframe),
        moodAnalytics: await this.getMoodAnalytics(userId, timeframe),
        timeframe
      };

      analytics.insights = await this.generatePersonalizedInsights(userId, analytics);
      return analytics;
    } catch (error) {
      logger.error('Error getting comprehensive analytics:', error);
      throw new Error(`Failed to get analytics: ${error?.message || 'Unknown error'}`);
    }
  }

  async getListeningTimeAnalytics(userId, timeframe) {
    try {
      const { startDate, previousStartDate } = this.getTimeframeDates(timeframe);
      
      // Get real listening history
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: 1 });

      const previousHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: previousStartDate, $lt: startDate }
      });

      // Calculate total listening time
      const totalMinutes = listeningHistory.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      const previousMinutes = previousHistory.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);

      // Group by day for daily breakdown
      const dailyData = {};
      listeningHistory.forEach(session => {
        const date = session.timestamp.toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { minutes: 0, sessions: 0 };
        }
        dailyData[date].minutes += session.duration || 0;
        dailyData[date].sessions += 1;
      });

      const dailyArray = Object.entries(dailyData).map(([date, data]) => ({
        date,
        minutes: data.minutes,
        sessions: data.sessions
      }));

      const avgDaily = dailyArray.length > 0 
        ? totalMinutes / dailyArray.length 
        : 0;

      const percentageChange = previousMinutes > 0
        ? ((totalMinutes - previousMinutes) / previousMinutes) * 100
        : 0;

      return {
        total: {
          minutes: Math.round(totalMinutes),
          hours: Math.round(totalMinutes / 60),
          sessions: listeningHistory.length
        },
        daily: {
          average: Math.round(avgDaily),
          breakdown: dailyArray,
          trend: percentageChange > 0 ? 'increasing' : 'decreasing'
        },
        comparison: {
          previousPeriod: Math.round(previousMinutes),
          percentageChange: Math.round(percentageChange)
        }
      };
    } catch (error) {
      logger.error('Error getting listening time analytics:', error);
      return {
        total: { minutes: 0, hours: 0, sessions: 0 },
        daily: { average: 0, breakdown: [], trend: 'stable' },
        comparison: { previousPeriod: 0, percentageChange: 0 }
      };
    }
  }

  async getTopGenresAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate('songId');

      // Count genre listening time
      const genreStats = {};
      let totalMinutes = 0;

      for (const session of listeningHistory) {
        if (session.songId?.genre) {
          const genre = session.songId.genre;
          const duration = session.duration || 0;
          
          if (!genreStats[genre]) {
            genreStats[genre] = { minutes: 0, plays: 0 };
          }
          genreStats[genre].minutes += duration;
          genreStats[genre].plays += 1;
          totalMinutes += duration;
        }
      }

      // Convert to array and sort
      const topGenres = Object.entries(genreStats)
        .map(([genre, stats]) => ({
          genre,
          minutes: Math.round(stats.minutes),
          plays: stats.plays,
          percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0
        }))
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 10);

      const uniqueGenres = Object.keys(genreStats).length;
      const diversityScore = uniqueGenres > 0 
        ? Math.min(uniqueGenres / 20, 1) 
        : 0;

      return {
        top: topGenres,
        diversity: {
          genreCount: uniqueGenres,
          genreDiversityScore: Math.round(diversityScore * 100) / 100
        }
      };
    } catch (error) {
      logger.error('Error getting top genres analytics:', error);
      return {
        top: [],
        diversity: { genreCount: 0, genreDiversityScore: 0 }
      };
    }
  }

  async getTopArtistsAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate({
        path: 'songId',
        populate: { path: 'artist' }
      });

      const artistStats = {};
      let totalMinutes = 0;

      for (const session of listeningHistory) {
        if (session.songId?.artist) {
          const artistId = session.songId.artist._id.toString();
          const duration = session.duration || 0;
          
          if (!artistStats[artistId]) {
            artistStats[artistId] = {
              artist: session.songId.artist,
              minutes: 0,
              plays: 0,
              songs: new Set()
            };
          }
          artistStats[artistId].minutes += duration;
          artistStats[artistId].plays += 1;
          artistStats[artistId].songs.add(session.songId._id.toString());
          totalMinutes += duration;
        }
      }

      const topArtists = Object.values(artistStats)
        .map(stats => ({
          artist: {
            id: stats.artist._id,
            name: stats.artist.name,
            image: stats.artist.image
          },
          minutes: Math.round(stats.minutes),
          plays: stats.plays,
          uniqueSongs: stats.songs.size,
          percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0
        }))
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 10);

      return topArtists;
    } catch (error) {
      logger.error('Error getting top artists analytics:', error);
      return [];
    }
  }

  async getTopSongsAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate({
        path: 'songId',
        populate: { path: 'artist' }
      });

      const songStats = {};

      for (const session of listeningHistory) {
        if (session.songId) {
          const songId = session.songId._id.toString();
          const duration = session.duration || 0;
          
          if (!songStats[songId]) {
            songStats[songId] = {
              song: session.songId,
              minutes: 0,
              plays: 0
            };
          }
          songStats[songId].minutes += duration;
          songStats[songId].plays += 1;
        }
      }

      const topSongs = Object.values(songStats)
        .map(stats => ({
          song: {
            id: stats.song._id,
            title: stats.song.title,
            artist: stats.song.artist?.name || 'Unknown',
            album: stats.song.album,
            coverArt: stats.song.coverArt
          },
          minutes: Math.round(stats.minutes),
          plays: stats.plays
        }))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10);

      return topSongs;
    } catch (error) {
      logger.error('Error getting top songs analytics:', error);
      return [];
    }
  }

  async getDiscoveryAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate({
        path: 'songId',
        populate: { path: 'artist' }
      });

      // Track unique new content
      const uniqueArtists = new Set();
      const uniqueSongs = new Set();
      const uniqueAlbums = new Set();
      const uniqueGenres = new Set();
      const discoveryMethods = {};

      for (const session of listeningHistory) {
        if (session.songId) {
          uniqueSongs.add(session.songId._id.toString());
          
          if (session.songId.artist) {
            uniqueArtists.add(session.songId.artist._id.toString());
          }
          if (session.songId.album) {
            uniqueAlbums.add(session.songId.album);
          }
          if (session.songId.genre) {
            uniqueGenres.add(session.songId.genre);
          }

          // Track discovery source
          const source = session.source || 'Direct Play';
          discoveryMethods[source] = (discoveryMethods[source] || 0) + 1;
        }
      }

      const totalPlays = listeningHistory.length;
      const discoveryMethodsArray = Object.entries(discoveryMethods)
        .map(([method, count]) => ({
          method,
          percentage: totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return {
        newContent: {
          artists: uniqueArtists.size,
          songs: uniqueSongs.size,
          albums: uniqueAlbums.size,
          genres: uniqueGenres.size
        },
        discoveryMethods: discoveryMethodsArray
      };
    } catch (error) {
      logger.error('Error getting discovery analytics:', error);
      return {
        newContent: { artists: 0, songs: 0, albums: 0, genres: 0 },
        discoveryMethods: []
      };
    }
  }

  async getListeningPatternsAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      });

      // Initialize hourly data
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        minutes: 0,
        sessions: 0
      }));

      const weekdayData = { weekday: 0, weekend: 0 };

      for (const session of listeningHistory) {
        const hour = session.timestamp.getHours();
        const day = session.timestamp.getDay();
        const duration = session.duration || 0;

        hourlyData[hour].minutes += duration;
        hourlyData[hour].sessions += 1;

        // Weekend is Saturday (6) and Sunday (0)
        if (day === 0 || day === 6) {
          weekdayData.weekend += duration;
        } else {
          weekdayData.weekday += duration;
        }
      }

      const morningMinutes = hourlyData.slice(6, 12).reduce((sum, h) => sum + h.minutes, 0);
      const afternoonMinutes = hourlyData.slice(12, 18).reduce((sum, h) => sum + h.minutes, 0);
      const eveningMinutes = hourlyData.slice(18, 24).reduce((sum, h) => sum + h.minutes, 0);
      const nightMinutes = hourlyData.slice(0, 6).reduce((sum, h) => sum + h.minutes, 0);

      const totalMinutes = morningMinutes + afternoonMinutes + eveningMinutes + nightMinutes;
      const daysInPeriod = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const avgDailyMinutes = daysInPeriod > 0 ? totalMinutes / daysInPeriod : 0;

      return {
        hourly: hourlyData.map(h => ({
          ...h,
          minutes: Math.round(h.minutes)
        })),
        habits: {
          morningListener: morningMinutes > 120,
          afternoonListener: afternoonMinutes > 120,
          eveningListener: eveningMinutes > 120,
          nightOwl: nightMinutes > 60,
          weekendWarrior: weekdayData.weekend > weekdayData.weekday,
          consistentListener: avgDailyMinutes > 30
        },
        timeOfDay: {
          morning: Math.round(morningMinutes),
          afternoon: Math.round(afternoonMinutes),
          evening: Math.round(eveningMinutes),
          night: Math.round(nightMinutes)
        }
      };
    } catch (error) {
      logger.error('Error getting listening patterns analytics:', error);
      return {
        hourly: Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0, sessions: 0 })),
        habits: {
          morningListener: false,
          afternoonListener: false,
          eveningListener: false,
          nightOwl: false,
          weekendWarrior: false,
          consistentListener: false
        },
        timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 }
      };
    }
  }

  async getAudioFeaturesAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate('songId');

      let totalTempo = 0;
      let totalEnergy = 0;
      let totalValence = 0;
      let totalDanceability = 0;
      let count = 0;

      for (const session of listeningHistory) {
        if (session.songId?.audioFeatures) {
          const features = session.songId.audioFeatures;
          totalTempo += features.tempo || 120;
          totalEnergy += features.energy || 0.5;
          totalValence += features.valence || 0.5;
          totalDanceability += features.danceability || 0.5;
          count++;
        }
      }

      if (count === 0) {
        return {
          preferences: {
            tempo: { average: 120, preference: 'moderate' },
            energy: { average: 0.5, preference: 'moderate' },
            valence: { average: 0.5, preference: 'neutral' },
            danceability: { average: 0.5, preference: 'moderate' }
          }
        };
      }

      const avgTempo = totalTempo / count;
      const avgEnergy = totalEnergy / count;
      const avgValence = totalValence / count;
      const avgDanceability = totalDanceability / count;

      return {
        preferences: {
          tempo: {
            average: Math.round(avgTempo),
            preference: avgTempo < 100 ? 'slow' : avgTempo > 130 ? 'fast' : 'moderate'
          },
          energy: {
            average: Math.round(avgEnergy * 100) / 100,
            preference: avgEnergy < 0.4 ? 'low' : avgEnergy > 0.7 ? 'high' : 'moderate'
          },
          valence: {
            average: Math.round(avgValence * 100) / 100,
            preference: avgValence < 0.4 ? 'melancholic' : avgValence > 0.7 ? 'happy' : 'neutral'
          },
          danceability: {
            average: Math.round(avgDanceability * 100) / 100,
            preference: avgDanceability < 0.4 ? 'low' : avgDanceability > 0.7 ? 'high' : 'moderate'
          }
        }
      };
    } catch (error) {
      logger.error('Error getting audio features analytics:', error);
      return {
        preferences: {
          tempo: { average: 120, preference: 'moderate' },
          energy: { average: 0.5, preference: 'moderate' },
          valence: { average: 0.5, preference: 'neutral' },
          danceability: { average: 0.5, preference: 'moderate' }
        }
      };
    }
  }

  async getDeviceUsageAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      });

      const deviceStats = {};
      let totalMinutes = 0;

      for (const session of listeningHistory) {
        const device = session.device || 'Unknown';
        const duration = session.duration || 0;
        
        if (!deviceStats[device]) {
          deviceStats[device] = { minutes: 0, sessions: 0 };
        }
        deviceStats[device].minutes += duration;
        deviceStats[device].sessions += 1;
        totalMinutes += duration;
      }

      const devices = Object.entries(deviceStats)
        .map(([name, stats]) => ({
          type: this.getDeviceType(name),
          name,
          minutes: Math.round(stats.minutes),
          sessions: stats.sessions,
          percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      const primaryDevice = devices[0]?.name || 'Unknown';
      const mobileUsage = devices
        .filter(d => d.type === 'Mobile')
        .reduce((sum, d) => sum + d.percentage, 0);

      return {
        devices,
        preferences: {
          primaryDevice,
          mobileUsage
        }
      };
    } catch (error) {
      logger.error('Error getting device usage analytics:', error);
      return {
        devices: [],
        preferences: { primaryDevice: 'Unknown', mobileUsage: 0 }
      };
    }
  }

  async getSkipAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate('songId');

      let totalPlays = 0;
      let skippedPlays = 0;
      let totalListenTime = 0;
      let completedPlays = 0;

      for (const session of listeningHistory) {
        totalPlays++;
        const duration = session.duration || 0;
        const songDuration = session.songId?.duration || 180; // Default 3 minutes
        
        totalListenTime += duration;

        // Consider skipped if listened less than 30 seconds or less than 30% of song
        if (duration < 30 || duration < songDuration * 0.3) {
          skippedPlays++;
        }

        // Consider completed if listened to at least 90% of song
        if (duration >= songDuration * 0.9) {
          completedPlays++;
        }
      }

      const skipRate = totalPlays > 0 ? skippedPlays / totalPlays : 0;
      const completionRate = totalPlays > 0 ? completedPlays / totalPlays : 0;
      const avgListenTime = totalPlays > 0 ? totalListenTime / totalPlays : 0;

      return {
        overall: {
          skipRate: Math.round(skipRate * 100) / 100,
          averageListenTime: Math.round(avgListenTime),
          completionRate: Math.round(completionRate * 100) / 100,
          totalPlays,
          skippedPlays,
          completedPlays
        }
      };
    } catch (error) {
      logger.error('Error getting skip analytics:', error);
      return {
        overall: {
          skipRate: 0,
          averageListenTime: 0,
          completionRate: 0,
          totalPlays: 0,
          skippedPlays: 0,
          completedPlays: 0
        }
      };
    }
  }

  async getMoodAnalytics(userId, timeframe) {
    try {
      const { startDate } = this.getTimeframeDates(timeframe);
      
      const listeningHistory = await ListeningHistory.find({
        userId,
        timestamp: { $gte: startDate }
      }).populate('songId');

      const moodStats = {};
      let totalMinutes = 0;

      for (const session of listeningHistory) {
        if (session.songId?.mood) {
          const mood = session.songId.mood;
          const duration = session.duration || 0;
          
          if (!moodStats[mood]) {
            moodStats[mood] = { minutes: 0, plays: 0 };
          }
          moodStats[mood].minutes += duration;
          moodStats[mood].plays += 1;
          totalMinutes += duration;
        }
      }

      const moodDistribution = Object.entries(moodStats)
        .map(([mood, stats]) => ({
          mood,
          minutes: Math.round(stats.minutes),
          hours: Math.round((stats.minutes / 60) * 10) / 10,
          plays: stats.plays,
          percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return {
        moodDistribution
      };
    } catch (error) {
      logger.error('Error getting mood analytics:', error);
      return {
        moodDistribution: []
      };
    }
  }

  async generatePersonalizedInsights(userId, analytics) {
    const insights = [];
    
    try {
      const dailyAvg = analytics?.listeningTime?.daily?.average || 0;
      const topGenre = analytics?.topGenres?.top?.[0];
      const topArtist = analytics?.topArtists?.[0];
      const habits = analytics?.listeningPatterns?.habits || {};
      const skipRate = analytics?.skipAnalytics?.overall?.skipRate || 0;

      // Heavy listener insight
      if (dailyAvg > 120) {
        insights.push({
          type: 'listening_time',
          title: 'Power Listener',
          description: `You're in the top 10% of listeners with ${dailyAvg} minutes per day!`,
          icon: '🎧',
          priority: 'high'
        });
      } else if (dailyAvg > 60) {
        insights.push({
          type: 'listening_time',
          title: 'Music Enthusiast',
          description: `You listen to music for ${dailyAvg} minutes per day on average`,
          icon: '🎵',
          priority: 'medium'
        });
      }

      // Genre preference insight
      if (topGenre && topGenre.percentage > 40) {
        insights.push({
          type: 'genre_preference',
          title: `${topGenre.genre} Devotee`,
          description: `${topGenre.percentage}% of your listening is ${topGenre.genre}`,
          icon: '🎸',
          priority: 'medium'
        });
      }

      // Top artist insight
      if (topArtist && topArtist.percentage > 15) {
        insights.push({
          type: 'artist_loyalty',
          title: 'Super Fan',
          description: `${topArtist.artist.name} is your most played artist at ${topArtist.percentage}%`,
          icon: '⭐',
          priority: 'high'
        });
      }

      // Listening habits insights
      if (habits.morningListener) {
        insights.push({
          type: 'habit',
          title: 'Morning Person',
          description: 'You love starting your day with music',
          icon: '🌅',
          priority: 'low'
        });
      }

      if (habits.nightOwl) {
        insights.push({
          type: 'habit',
          title: 'Night Owl',
          description: 'Late night listening sessions are your thing',
          icon: '🌙',
          priority: 'low'
        });
      }

      if (habits.weekendWarrior) {
        insights.push({
          type: 'habit',
          title: 'Weekend Warrior',
          description: 'You listen more on weekends',
          icon: '🎉',
          priority: 'low'
        });
      }

      // Skip rate insight
      if (skipRate < 0.1) {
        insights.push({
          type: 'engagement',
          title: 'Committed Listener',
          description: 'You rarely skip songs - you know what you like!',
          icon: '✅',
          priority: 'medium'
        });
      } else if (skipRate > 0.3) {
        insights.push({
          type: 'engagement',
          title: 'Selective Listener',
          description: 'You skip often - maybe try our personalized playlists?',
          icon: '⏭️',
          priority: 'medium'
        });
      }

      // Discovery insight
      const newArtists = analytics?.discoveries?.newContent?.artists || 0;
      if (newArtists > 20) {
        insights.push({
          type: 'discovery',
          title: 'Music Explorer',
          description: `You discovered ${newArtists} new artists this period!`,
          icon: '🔍',
          priority: 'high'
        });
      }

    } catch (error) {
      logger.error('Error generating insights:', error);
    }

    return insights;
  }

  getTimeframeDates(timeframe) {
    const now = new Date();
    let startDate, previousStartDate;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        previousStartDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    }
    
    return { startDate, previousStartDate };
  }

  getDeviceType(deviceName) {
    const name = deviceName.toLowerCase();
    if (name.includes('iphone') || name.includes('android') || name.includes('mobile')) {
      return 'Mobile';
    }
    if (name.includes('ipad') || name.includes('tablet')) {
      return 'Tablet';
    }
    if (name.includes('alexa') || name.includes('google home') || name.includes('speaker')) {
      return 'Smart Speaker';
    }
    if (name.includes('tv') || name.includes('roku') || name.includes('chromecast')) {
      return 'TV';
    }
    return 'Desktop';
  }
}

export default new PremiumAnalyticsService();