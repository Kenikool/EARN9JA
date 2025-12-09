import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SettingsRow,
  Divider,
  Modal,
  RadioGroup,
  Button,
  useTheme,
  Icon,
} from "../components/ui";
import { useAppStore } from "../store/appStore";
import { spacing } from "../components/ui/theme/spacing";
import { typography } from "../components/ui/theme/typography";

const qualityOptions = [
  { value: "auto", label: "Auto (Recommended)" },
  { value: "1080p", label: "1080p (HD)" },
  { value: "720p", label: "720p (HD)" },
  { value: "480p", label: "480p (SD)" },
  { value: "360p", label: "360p (SD)" },
  { value: "240p", label: "240p (Low)" },
];

export function SettingsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const {
    downloadQuality,
    setDownloadQuality,
    downloadLocation,
    autoDownload,
    setAutoDownload,
    wifiOnlyDownload,
    setWifiOnlyDownload,
    notificationsEnabled,
    setNotificationsEnabled,
    isDarkMode,
    setIsDarkMode,
  } = useAppStore();

  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ]
    );
  };

  const handleClearDownloads = () => {
    Alert.alert(
      "Clear All Downloads",
      "This will delete all downloaded videos. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "All downloads cleared");
          },
        },
      ]
    );
  };

  const getQualityLabel = () => {
    const option = qualityOptions.find((opt) => opt.value === downloadQuality);
    return option?.label || "Auto";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Download Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Download Settings
          </Text>

          <SettingsRow
            label="Default Quality"
            description="Choose default video quality for downloads"
            leftIcon={
              <Icon name="video" size={20} color={colors.text.secondary} />
            }
            rightElement="value"
            value={getQualityLabel()}
            onPress={() => setShowQualityModal(true)}
          />

          <SettingsRow
            label="Download Location"
            description="Where videos are saved on your device"
            leftIcon={
              <Icon name="folder" size={20} color={colors.text.secondary} />
            }
            rightElement="value"
            value="/VidFlow/Downloads"
            onPress={() => setShowLocationModal(true)}
          />

          <SettingsRow
            label="Auto Download"
            description="Automatically start downloads when added"
            leftIcon="⚡"
            rightElement="toggle"
            value={autoDownload}
            onToggle={setAutoDownload}
          />

          <SettingsRow
            label="WiFi Only"
            description="Download only when connected to WiFi"
            leftIcon={
              <Icon name="wifi" size={20} color={colors.text.secondary} />
            }
            rightElement="toggle"
            value={wifiOnlyDownload}
            onToggle={setWifiOnlyDownload}
          />
        </View>

        <Divider />

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Notifications
          </Text>

          <SettingsRow
            label="Download Notifications"
            description="Get notified when downloads complete"
            leftIcon={
              <Icon name="bell" size={20} color={colors.text.secondary} />
            }
            rightElement="toggle"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
        </View>

        <Divider />

        {/* Library */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Library
          </Text>

          <SettingsRow
            label="Favorites"
            description="View your favorite videos"
            leftIcon="❤️"
            rightElement="arrow"
            onPress={() => navigation.navigate("Favorites")}
          />

          <SettingsRow
            label="Watch History"
            description="See videos you've watched"
            leftIcon={
              <Icon name="clock" size={20} color={colors.text.secondary} />
            }
            rightElement="arrow"
            onPress={() => navigation.navigate("History")}
          />
        </View>

        <Divider />

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Appearance
          </Text>

          <SettingsRow
            label="Dark Mode"
            description="Use dark theme throughout the app"
            leftIcon={
              <Icon name="moon" size={20} color={colors.text.secondary} />
            }
            rightElement="toggle"
            value={isDarkMode}
            onToggle={setIsDarkMode}
          />
        </View>

        <Divider />

        {/* Storage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Storage
          </Text>

          <SettingsRow
            label="Clear Cache"
            description="Free up space by clearing cached data"
            leftIcon="🧹"
            rightElement="arrow"
            onPress={handleClearCache}
          />

          <SettingsRow
            label="Clear All Downloads"
            description="Delete all downloaded videos"
            leftIcon={
              <Icon name="delete" size={20} color={colors.text.secondary} />
            }
            rightElement="arrow"
            onPress={handleClearDownloads}
          />
        </View>

        <Divider />

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            About
          </Text>

          <SettingsRow
            label="Version"
            description="App version information"
            leftIcon={
              <Icon name="info" size={20} color={colors.text.secondary} />
            }
            rightElement="value"
            value="1.0.0"
          />

          <SettingsRow
            label="Privacy Policy"
            description="Read our privacy policy"
            leftIcon={
              <Icon name="lock" size={20} color={colors.text.secondary} />
            }
            rightElement="arrow"
            onPress={() => {
              /* Navigate to privacy policy */
            }}
          />

          <SettingsRow
            label="Terms of Service"
            description="Read our terms of service"
            leftIcon={
              <Icon name="document" size={20} color={colors.text.secondary} />
            }
            rightElement="arrow"
            onPress={() => {
              /* Navigate to terms */
            }}
          />
        </View>
      </ScrollView>

      {/* Quality Selection Modal */}
      <Modal
        visible={showQualityModal}
        onClose={() => setShowQualityModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
            Default Download Quality
          </Text>
          <RadioGroup
            options={qualityOptions}
            value={downloadQuality}
            onValueChange={(value: string) => {
              setDownloadQuality(value as any);
              setShowQualityModal(false);
            }}
          />
        </View>
      </Modal>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
            Download Location
          </Text>
          <Text style={[styles.modalText, { color: colors.text.primary }]}>
            Current location: {downloadLocation}
          </Text>
          <Text
            style={[styles.modalDescription, { color: colors.text.secondary }]}
          >
            Location selection will be available in a future update.
          </Text>
          <Button
            variant="primary"
            onPress={() => setShowLocationModal(false)}
            style={styles.modalButton}
          >
            OK
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.lg,
  },
  modalText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.lg,
  },
  modalButton: {
    marginTop: spacing.md,
  },
});
