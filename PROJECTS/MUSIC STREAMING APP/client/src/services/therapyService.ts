import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface MoodData {
  overall: number;
  energy?: number;
  stress?: number;
  anxiety?: number;
  happiness?: number;
  focus?: number;
  motivation?: number;
}

export interface TherapySession {
  sessionId: string;
  sessionType: string;
  playlist: Array<{
    songId: string;
    therapeuticPurpose: string;
    duration: number;
  }>;
  protocol: {
    duration: number;
    progression: string[];
    instructions: string[];
  };
}

export interface SessionFeedback {
  rating: number;
  notes?: string;
  goalAchievement: 'not_achieved' | 'partially_achieved' | 'fully_achieved';
}

export interface MoodTracking {
  moodEntryId: string;
  recommendations: {
    suggestedMusic: string[];
    suggestedActivities: string[];
    therapyRecommendation: boolean;
  };
}

export interface TherapyAnalytics {
  totalSessions: number;
  totalDuration: number;
  averageRating: number;
  moodImprovement: number;
  sessionTypes: Record<string, any>;
  progressTrend: string;
  recommendations: string[];
}

export interface SessionType {
  id: string;
  name: string;
  description: string;
  duration: string;
  benefits: string[];
}

class TherapyService {
  async startSession(
    sessionType: string,
    options: {
      duration?: number;
      mode?: 'guided' | 'self_directed' | 'ai_assisted';
      preSessionMood?: MoodData;
    } = {}
  ): Promise<TherapySession> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/therapy/sessions/start`, {
        sessionType,
        ...options
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to start therapy session:', error);
      throw new Error(error.response?.data?.message || 'Failed to start therapy session');
    }
  }

  async updateProgress(
    sessionId: string,
    songId: string,
    userResponse: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive',
    currentTime: number
  ): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/therapy/sessions/progress`, {
        sessionId,
        songId,
        userResponse,
        currentTime
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to update session progress:', error);
      throw new Error(error.response?.data?.message || 'Failed to update session progress');
    }
  }

  async endSession(
    sessionId: string,
    postSessionMood: MoodData,
    userFeedback?: SessionFeedback
  ): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/therapy/sessions/end`, {
        sessionId,
        postSessionMood,
        userFeedback
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to end therapy session:', error);
      throw new Error(error.response?.data?.message || 'Failed to end therapy session');
    }
  }

  async trackMood(
    mood: MoodData,
    options: {
      triggers?: string[];
      activities?: string[];
      notes?: string;
      musicContext?: any;
    } = {}
  ): Promise<MoodTracking> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/therapy/mood/track`, {
        mood,
        ...options
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to track mood:', error);
      throw new Error(error.response?.data?.message || 'Failed to track mood');
    }
  }

  async getMoodHistory(days = 30): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/therapy/mood/history`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to get mood history:', error);
      throw new Error(error.response?.data?.message || 'Failed to get mood history');
    }
  }

  async getAnalytics(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<TherapyAnalytics> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/therapy/analytics`, {
        params: { timeframe },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.analytics;
    } catch (error: any) {
      console.error('Failed to get therapy analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to get therapy analytics');
    }
  }

  async getSessionTypes(): Promise<SessionType[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/therapy/session-types`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.sessionTypes;
    } catch (error: any) {
      console.error('Failed to get session types:', error);
      throw new Error(error.response?.data?.message || 'Failed to get session types');
    }
  }

  async getRecommendations(): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/therapy/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.recommendations;
    } catch (error: any) {
      console.error('Failed to get therapy recommendations:', error);
      throw new Error(error.response?.data?.message || 'Failed to get therapy recommendations');
    }
  }

  // Utility methods for mood assessment
  createMoodAssessment(): MoodData {
    return {
      overall: 5,
      energy: 5,
      stress: 5,
      anxiety: 5,
      happiness: 5,
      focus: 5,
      motivation: 5
    };
  }

  validateMoodData(mood: MoodData): boolean {
    const requiredFields = ['overall'];
    const optionalFields = ['energy', 'stress', 'anxiety', 'happiness', 'focus', 'motivation'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in mood) || mood[field as keyof MoodData] < 1 || mood[field as keyof MoodData] > 10) {
        return false;
      }
    }

    // Check optional fields if present
    for (const field of optionalFields) {
      if (field in mood) {
        const value = mood[field as keyof MoodData];
        if (value !== undefined && (value < 1 || value > 10)) {
          return false;
        }
      }
    }

    return true;
  }

  getMoodDescription(value: number): string {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Good';
    return 'Excellent';
  }

  getMoodColor(value: number): string {
    if (value <= 3) return '#ef4444'; // red
    if (value <= 5) return '#f59e0b'; // amber
    if (value <= 7) return '#eab308'; // yellow
    if (value <= 8) return '#84cc16'; // lime
    return '#22c55e'; // green
  }

  calculateMoodTrend(history: any[]): 'improving' | 'declining' | 'stable' {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(0, 7);
    const older = history.slice(7, 14);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood.overall, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.mood.overall, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }
}

export const therapyService = new TherapyService();