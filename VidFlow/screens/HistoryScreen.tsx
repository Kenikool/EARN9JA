import React from "react";
import { View, Text, StyleSheet, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  VideoCard,
  EmptyState,
  IconButton,
  Button,
  useTheme,
  Icon,
} from "../components/ui";
import { useAppStore } from "../store/appStore";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";

export function HistoryScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { watchHistory, clearHistory, addToHistory } = useAppStore();

  const handleVideoPress = (video: any) => {
    addToHistory(video);
    navigation.navigate("VideoDetails", { video });
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your watch history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearHistory(),
        },
      ]
    );
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
          Watch History
        </Text>
        {watchHistory.length > 0 && (
          <IconButton
            icon={
              <Icon name="delete" size={24} color={colors.text.secondary} />
            }
            onPress={handleClearHistory}
            size="md"
            variant="ghost"
          />
        )}
      </View>

      {/* Content */}
      {watchHistory.length === 0 ? (
        <EmptyState
          icon={<Icon name="clock" size={64} color={colors.text.secondary} />}
          title="No History Yet"
          description="Videos you watch will appear here"
          actionLabel="Browse Videos"
          onAction={() => navigation.navigate("Home")}
        />
      ) : (
        <>
          <View style={styles.infoBar}>
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              {watchHistory.length} videos watched
            </Text>
            <Button variant="ghost" onPress={handleClearHistory}>
              Clear All
            </Button>
          </View>
          <FlatList
            data={watchHistory}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
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
            )}
            contentContainerStyle={styles.videoList}
          />
        </>
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
    flex: 1,
    textAlign: "center",
  },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
  },
  videoList: {
    paddingHorizontal: spacing.lg,
  },
});
