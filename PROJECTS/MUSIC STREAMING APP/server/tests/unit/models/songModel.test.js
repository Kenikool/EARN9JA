import { jest } from '@jest/globals';

describe('Song Model', () => {
  let Song;
  let mockSong;

  beforeAll(async () => {
    const songModule = await import('../../../src/models/music/Song.js');
    Song = songModule.default;
  });

  beforeEach(() => {
    mockSong = {
      title: 'Test Song',
      artist: '507f1f77bcf86cd799439011',
      duration: 180,
      releaseDate: new Date('2024-01-01'),
      genre: ['Pop'],
      status: 'published',
      visibility: 'public',
      playCount: 100,
      likes: 50,
      audioFiles: {
        high: { url: 'https://example.com/song.mp3', bitrate: 320 }
      },
      analytics: {
        weeklyPlays: 10,
        monthlyPlays: 50,
        skipRate: 0.1,
        completionRate: 0.9,
        averageListenTime: 150,
        topCountries: []
      },
      save: jest.fn().mockResolvedValue(true)
    };
  });

  describe('Schema Validation', () => {
    it('should require title', () => {
      const song = new Song({});
      const error = song.validateSync();
      expect(error.errors.title).toBeDefined();
    });

    it('should require artist', () => {
      const song = new Song({ title: 'Test' });
      const error = song.validateSync();
      expect(error.errors.artist).toBeDefined();
    });

    it('should require duration', () => {
      const song = new Song({ 
        title: 'Test',
        artist: '507f1f77bcf86cd799439011'
      });
      const error = song.validateSync();
      expect(error.errors.duration).toBeDefined();
    });

    it('should require releaseDate', () => {
      const song = new Song({ 
        title: 'Test',
        artist: '507f1f77bcf86cd799439011',
        duration: 180
      });
      const error = song.validateSync();
      expect(error.errors.releaseDate).toBeDefined();
    });

    it('should validate duration minimum', () => {
      const song = new Song({
        title: 'Test',
        artist: '507f1f77bcf86cd799439011',
        duration: 0,
        releaseDate: new Date()
      });
      const error = song.validateSync();
      expect(error.errors.duration).toBeDefined();
    });
  });

  describe('Virtual Properties', () => {
    it('should calculate formattedDuration', () => {
      const song = new Song(mockSong);
      expect(song.formattedDuration).toBe('3:00');
    });

    it('should calculate releaseYear', () => {
      const song = new Song(mockSong);
      expect(song.releaseYear).toBe(2024);
    });

    it('should return null releaseYear if no releaseDate', () => {
      const song = new Song({ ...mockSong, releaseDate: null });
      expect(song.releaseYear).toBeNull();
    });
  });

  describe('incrementPlayCount Method', () => {
    it('should increment play count and analytics', async () => {
      const song = new Song(mockSong);

      await song.incrementPlayCount();

      expect(song.playCount).toBe(101);
      expect(song.analytics.weeklyPlays).toBe(11);
      expect(song.analytics.monthlyPlays).toBe(51);
      expect(song.save).toHaveBeenCalled();
    });
  });

  describe('addLike Method', () => {
    it('should increment likes', async () => {
      const song = new Song(mockSong);

      await song.addLike();

      expect(song.likes).toBe(51);
      expect(song.save).toHaveBeenCalled();
    });
  });

  describe('removeLike Method', () => {
    it('should decrement likes', async () => {
      const song = new Song(mockSong);

      await song.removeLike();

      expect(song.likes).toBe(49);
      expect(song.save).toHaveBeenCalled();
    });

    it('should not go below zero', async () => {
      const song = new Song({ ...mockSong, likes: 0 });

      await song.removeLike();

      expect(song.likes).toBe(0);
    });
  });

  describe('incrementDownload Method', () => {
    it('should increment downloads', async () => {
      const song = new Song({ ...mockSong, downloads: 10 });

      await song.incrementDownload();

      expect(song.downloads).toBe(11);
      expect(song.save).toHaveBeenCalled();
    });
  });

  describe('isAvailableInRegion Method', () => {
    it('should return true if no region restrictions', () => {
      const song = new Song({
        ...mockSong,
        availability: { regions: [] }
      });

      expect(song.isAvailableInRegion('US')).toBe(true);
    });

    it('should return true if region is in allowed list', () => {
      const song = new Song({
        ...mockSong,
        availability: { regions: ['US', 'CA', 'UK'] }
      });

      expect(song.isAvailableInRegion('US')).toBe(true);
    });

    it('should return false if region is not in allowed list', () => {
      const song = new Song({
        ...mockSong,
        availability: { regions: ['US', 'CA'] }
      });

      expect(song.isAvailableInRegion('UK')).toBe(false);
    });
  });

  describe('isCurrentlyAvailable Method', () => {
    it('should return true if no date restrictions', () => {
      const song = new Song({
        ...mockSong,
        availability: {}
      });

      expect(song.isCurrentlyAvailable()).toBe(true);
    });

    it('should return false if before start date', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const song = new Song({
        ...mockSong,
        availability: { startDate: futureDate }
      });

      expect(song.isCurrentlyAvailable()).toBe(false);
    });

    it('should return false if after end date', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const song = new Song({
        ...mockSong,
        availability: { endDate: pastDate }
      });

      expect(song.isCurrentlyAvailable()).toBe(false);
    });

    it('should return true if within date range', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const song = new Song({
        ...mockSong,
        availability: { startDate: pastDate, endDate: futureDate }
      });

      expect(song.isCurrentlyAvailable()).toBe(true);
    });
  });

  describe('getAudioFileUrl Method', () => {
    it('should return URL for specified quality', () => {
      const song = new Song(mockSong);

      const url = song.getAudioFileUrl('high');

      expect(url).toBe('https://example.com/song.mp3');
    });

    it('should fallback to legacy audioUrl', () => {
      const song = new Song({
        ...mockSong,
        audioFiles: {},
        audioUrl: 'https://example.com/legacy.mp3'
      });

      const url = song.getAudioFileUrl('high');

      expect(url).toBe('https://example.com/legacy.mp3');
    });
  });

  describe('updateAnalytics Method', () => {
    it('should update completion rate', async () => {
      const song = new Song(mockSong);

      await song.updateAnalytics({
        listenTime: 180,
        completed: true,
        skipped: false
      });

      expect(song.analytics.completionRate).toBeGreaterThan(0.9);
      expect(song.save).toHaveBeenCalled();
    });

    it('should update skip rate', async () => {
      const song = new Song(mockSong);

      await song.updateAnalytics({
        listenTime: 60,
        completed: false,
        skipped: true
      });

      expect(song.analytics.skipRate).toBeGreaterThan(0.1);
    });

    it('should update average listen time', async () => {
      const song = new Song(mockSong);

      await song.updateAnalytics({
        listenTime: 120,
        completed: false,
        skipped: false
      });

      expect(song.analytics.averageListenTime).toBeLessThan(150);
    });

    it('should update country stats', async () => {
      const song = new Song(mockSong);

      await song.updateAnalytics({
        listenTime: 180,
        completed: true,
        skipped: false,
        country: 'US'
      });

      expect(song.analytics.topCountries).toHaveLength(1);
      expect(song.analytics.topCountries[0].country).toBe('US');
      expect(song.analytics.topCountries[0].plays).toBe(1);
    });

    it('should limit top countries to 10', async () => {
      const song = new Song({
        ...mockSong,
        analytics: {
          ...mockSong.analytics,
          topCountries: Array.from({ length: 10 }, (_, i) => ({
            country: `C${i}`,
            plays: 10 - i
          }))
        }
      });

      await song.updateAnalytics({
        listenTime: 180,
        completed: true,
        skipped: false,
        country: 'NEW'
      });

      expect(song.analytics.topCountries).toHaveLength(10);
    });
  });

  describe('Static Methods', () => {
    it('should find published songs', () => {
      const query = Song.findPublished();
      expect(query).toBeDefined();
    });

    it('should find songs by genre', () => {
      const query = Song.findByGenre('Pop');
      expect(query).toBeDefined();
    });

    it('should find songs by artist', () => {
      const query = Song.findByArtist('507f1f77bcf86cd799439011');
      expect(query).toBeDefined();
    });

    it('should find trending songs', () => {
      const query = Song.findTrending(50);
      expect(query).toBeDefined();
    });

    it('should find new releases', () => {
      const query = Song.findNewReleases(30, 50);
      expect(query).toBeDefined();
    });

    it('should find songs by mood', () => {
      const query = Song.findByMood('happy', 50);
      expect(query).toBeDefined();
    });

    it('should search songs', () => {
      const query = Song.searchSongs('test query', 50);
      expect(query).toBeDefined();
    });
  });

  describe('Pre-save Middleware', () => {
    it('should generate search keywords from title', () => {
      const song = new Song({
        ...mockSong,
        title: 'Amazing Test Song',
        genre: ['Pop', 'Rock'],
        tags: ['upbeat', 'summer']
      });

      song.save();

      expect(song.searchKeywords).toContain('amazing');
      expect(song.searchKeywords).toContain('test');
      expect(song.searchKeywords).toContain('song');
      expect(song.searchKeywords).toContain('pop');
      expect(song.searchKeywords).toContain('rock');
    });

    it('should set legacy audioUrl from audioFiles', () => {
      const song = new Song({
        ...mockSong,
        audioUrl: null,
        audioFiles: {
          high: { url: 'https://example.com/new.mp3' }
        }
      });

      song.save();

      expect(song.audioUrl).toBe('https://example.com/new.mp3');
    });
  });
});
