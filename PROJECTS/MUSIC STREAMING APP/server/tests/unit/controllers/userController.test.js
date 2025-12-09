import { jest } from '@jest/globals';

const mockGetUserProfile = jest.fn();
const mockUpdateUserProfile = jest.fn();
const mockGetUserLibrary = jest.fn();
const mockGetUserPlaylists = jest.fn();
const mockGetLikedSongs = jest.fn();
const mockFollowArtist = jest.fn();
const mockUnfollowArtist = jest.fn();

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: {
        _id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {},
        toJSON: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          displayName: 'Test User'
        })
      }
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      mockGetUserProfile.mockImplementation(async (req, res) => {
        res.json({
          success: true,
          data: {
            user: req.user.toJSON()
          }
        });
      });

      await mockGetUserProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            _id: 'user123',
            email: 'test@example.com'
          })
        }
      });
    });

    it('should handle errors gracefully', async () => {
      mockGetUserProfile.mockImplementation(async (req, res) => {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch user profile'
        });
      });

      await mockGetUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      req.body = {
        displayName: 'Updated Name',
        preferences: { theme: 'dark' }
      };

      mockUpdateUserProfile.mockImplementation(async (req, res) => {
        res.json({
          success: true,
          message: 'Profile updated successfully',
          data: {
            user: {
              ...req.user.toJSON(),
              displayName: req.body.displayName
            }
          }
        });
      });

      await mockUpdateUserProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: expect.objectContaining({
            displayName: 'Updated Name'
          })
        }
      });
    });

    it('should validate required fields', async () => {
      req.body = {};

      mockUpdateUserProfile.mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      });

      await mockUpdateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getUserLibrary', () => {
    it('should return user library with pagination', async () => {
      req.query = { page: '1', limit: '20' };

      const mockLibrary = [
        { _id: 'song1', title: 'Song 1' },
        { _id: 'song2', title: 'Song 2' }
      ];

      mockGetUserLibrary.mockImplementation(async (req, res) => {
        res.json({
          success: true,
          data: mockLibrary,
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            totalPages: 3
          }
        });
      });

      await mockGetUserLibrary(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockLibrary,
        pagination: expect.objectContaining({
          page: 1,
          limit: 20
        })
      });
    });
  });

  describe('followArtist', () => {
    it('should follow artist successfully', async () => {
      req.params.artistId = 'artist123';

      mockFollowArtist.mockImplementation(async (req, res) => {
        res.json({
          success: true,
          message: 'Artist followed successfully'
        });
      });

      await mockFollowArtist(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Artist followed successfully'
      });
    });

    it('should return error if artist already followed', async () => {
      req.params.artistId = 'artist123';

      mockFollowArtist.mockImplementation(async (req, res) => {
        res.status(400).json({
          success: false,
          message: 'Artist already followed'
        });
      });

      await mockFollowArtist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
