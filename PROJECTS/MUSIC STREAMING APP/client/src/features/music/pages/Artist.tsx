import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Users,
  Music,
  Star,
  RefreshCw,
  Share,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { SongCard } from "@/features/music/components/SongCard";
import { musicService } from "../services/musicService";
import toast from "react-hot-toast";

interface Artist {
  _id: string;
  name: string;
  avatar?: string;
  verified?: boolean;
  followers: number;
  genre: string[];
  bio?: string;
}

interface Song {
  _id: string;
  title: string;
  artist?: {
    _id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  album?: {
    _id: string;
    title: string;
    coverArt?: string;
  };
  duration?: number;
  coverArt?: string;
  audioUrl?: string;
  genre?: string[];
  playCount?: number;
  likes?: number;
  isExplicit?: boolean;
  releaseDate: string;
}

export const Artist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());

  // Check if user came from Discover page
  const isFromDiscover = location.state?.from === "/discover";

  const fetchArtistData = async (isRetry: boolean = false) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      if (isRetry) {
        console.log(`Retrying artist data fetch (attempt ${retryCount + 1})`);
      }

      // Fetch artist details first (critical)
      const artistRes = await musicService.getArtist(id);

      if (artistRes.success) {
        setArtist(artistRes.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        if (artistRes.status === 404) {
          setError("Artist not found");
          return;
        } else {
          throw new Error(artistRes.message || "Failed to load artist");
        }
      }

      // Fetch songs (non-critical - can fail gracefully)
      try {
        const songsRes = await musicService.getArtistSongs(id, 20, 1);
        if (songsRes.success) {
          setSongs(songsRes.data || []);
        } else {
          console.warn("Failed to load artist songs:", songsRes.message);
          setSongs([]); // Set empty array if songs fail to load
        }
      } catch (songsError: any) {
        console.warn("Error fetching artist songs (non-critical):", songsError);
        setSongs([]); // Set empty array if songs fail to load
      }
    } catch (error: any) {
      console.error("Error fetching artist data:", error);

      // Handle different types of errors
      if (error.isNetworkError || error.status >= 500) {
        setError("Server is temporarily unavailable. Please try again.");

        // Auto-retry for network/server errors (up to 3 times)
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            fetchArtistData(true);
          }, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }
      } else if (error.status === 404) {
        setError("Artist not found");
      } else {
        setError(error.message || "Failed to load artist");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isFromDiscover) {
      navigate("/discover");
    } else {
      navigate(-1);
    }
  };

  const handleFollow = async () => {
    if (!artist) return;

    try {
      if (isFollowing) {
        await musicService.unfollowArtist(artist._id);
        setIsFollowing(false);
        toast.success("Unfollowed artist");
      } else {
        await musicService.followArtist(artist._id);
        setIsFollowing(true);
        toast.success("Following artist");
      }
    } catch (error: any) {
      console.error("Follow/unfollow error:", error);
      if (error.isNetworkError) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to update follow status");
      }
    }
  };

  const handleShare = async () => {
    if (!artist) return;

    try {
      const url = `${window.location.origin}/artist/${artist._id}`;

      // Try Web Share API first if available
      if (navigator.share) {
        await navigator.share({
          title: artist.name,
          text: `Check out ${artist.name} on our music platform!`,
          url: url,
        });
        toast.success("Artist shared successfully!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Artist link copied to clipboard");
      }
    } catch (error: any) {
      console.error("Share error:", error);
      if (error.name === "AbortError") {
        // User cancelled sharing - don't show error
        return;
      }
      toast.error("Failed to share artist");
    }
  };

  const handlePlay = (song: Song) => {
    setCurrentlyPlaying(song._id);
    console.log("Playing song:", song.title);
  };

  const handlePause = () => {
    setCurrentlyPlaying(null);
  };

  const handleLikeChange = (songId: string, isLiked: boolean) => {
    setLikedSongs((prev) => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.add(songId);
      } else {
        newSet.delete(songId);
      }
      return newSet;
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  useEffect(() => {
    fetchArtistData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading artist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {error.includes("not found")
              ? "Artist not found"
              : "Failed to load artist"}
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => fetchArtistData()}
              className="bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Retrying..." : "Try Again"}
            </Button>
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-600 text-gray-300 hover:border-white hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              Retry attempt {retryCount}/3
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!artist && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Artist not found
          </h3>
          <p className="text-gray-400 mb-6">
            The artist you're looking for doesn't exist.
          </p>
          <Button
            onClick={handleBack}
            className="bg-green-500 hover:bg-green-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isFromDiscover ? "Back to Discover" : "Back"}
          </Button>
        </motion.div>

        {/* Artist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8"
        >
          <div className="w-64 h-64 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
            <img
              src={
                artist.avatar ||
                "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
              }
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Artist
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-white flex items-center">
                {artist.name}
                {artist.verified && (
                  <Star className="w-8 h-8 ml-3 text-blue-500" />
                )}
              </h1>
            </div>

            <div className="flex items-center space-x-6 text-gray-400">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {formatNumber(artist.followers)} followers
              </span>
              {songs.length > 0 && (
                <span className="flex items-center">
                  <Music className="w-4 h-4 mr-1" />
                  {songs.length} songs
                </span>
              )}
            </div>

            {artist.genre && artist.genre.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {artist.genre.map((genre, index) => (
                  <Badge key={index} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8"
                onClick={() => songs.length > 0 && handlePlay(songs[0])}
                disabled={songs.length === 0}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleFollow}
                className={`rounded-full px-6 ${isFollowing
                  ? "border-green-500 text-green-500 hover:bg-green-500/10"
                  : "border-gray-600 text-gray-300 hover:border-white hover:text-white"
                  }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={handleShare}
                className="text-gray-400 hover:text-white"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Artist Bio */}
        {artist.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-3">About</h2>
            <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
          </motion.div>
        )}

        {/* Popular Songs */}
        {songs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white">Popular Songs</h2>
            <div className="space-y-1">
              {songs.slice(0, 10).map((song, index) => (
                <SongCard
                  key={song._id}
                  song={song}
                  variant="list"
                  showIndex={true}
                  index={index + 1}
                  isPlaying={currentlyPlaying === song._id}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  isLiked={likedSongs.has(song._id)}
                  onLikeChange={handleLikeChange}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {songs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No songs available
            </h3>
            <p className="text-gray-400">
              This artist hasn't released any songs yet.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
