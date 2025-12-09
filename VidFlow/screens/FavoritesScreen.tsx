import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoCard, EmptyState, IconButton, useTheme } from "../components/ui";
import { useAppStore } from "../store/appStore";
import { videoService } from "../services/videoService";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";

export function FavoritesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { favorites, removeFavorite, addToHistory } = useAppStore();
  const [favoriteVideos, setFavoriteVideos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    // In a real app, fetch video details for favorite IDs
    // For now, we'll use mock data
    const videos = await videoService.getTrendingVideos("trending");
    const favVideos = videos.filter((v) => favorites.includes(v.id));
    setFavoriteVideos(favVideos);
    setLoading(false);
  };

  const handleVideoPress = (video: any) => {
    addToHistory(video);
    navigation.navigate("VideoDetails", { video });
  };

  const handleRemoveFavorite = (videoId: string) => {
    removeFavorite(videoId);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="←"
          onPress={() => navigation.goBack()}
          size="md"
          variant="ghost"
        />
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Favorites
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {favoriteVideos.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="No Favorites Yet"
          description="Videos you favorite will appear here"
          actionLabel="Browse Videos"
          onAction={() => navigation.navigate("Home")}
        />
      ) : (
        <FlatList
          data={favoriteVideos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.videoItem}>
              <VideoCard
                thumbnail={item.thumbnail}
                title={item.title}
                channelName={item.channelName}
                views={item.views}
                duration={item.duration}
                publishedAt={item.publishedAt}
                onPress={() => handleVideoPress(item)}
                onDownload={() =>
                  navigation.navigate("VideoDetails", { video: item })
                }
              />
              <IconButton
                icon="❤️"
                onPress={() => handleRemoveFavorite(item.id)}
                size="md"
                variant="ghost"
                style={styles.removeButton}
              />
            </View>
          )}
          contentContainerStyle={styles.videoList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  videoList: {
    paddingHorizontal: spacing.lg,
  },
  videoItem: {
    position: "relative",
    marginBottom: spacing.md,
  },
  removeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
});
