import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useTheme } from "./theme/ThemeProvider";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
}) => {
  const { theme, spacing, typography, borderRadius, shadows } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.card,
              borderRadius: borderRadius.xl,
              ...shadows.xl,
            },
          ]}
        >
          {title && (
            <View
              style={[
                styles.header,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.divider,
                  padding: spacing.lg,
                },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text.primary,
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                  },
                ]}
              >
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text
                  style={[
                    styles.closeText,
                    {
                      color: theme.text.secondary,
                      fontSize: typography.fontSize["2xl"],
                    },
                  ]}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView
            style={[styles.content, { padding: spacing.lg }]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer && (
            <View
              style={[
                styles.footer,
                {
                  borderTopWidth: 1,
                  borderTopColor: theme.divider,
                  padding: spacing.lg,
                },
              ]}
            >
              {footer}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    width: "90%",
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {},
  closeButton: {
    padding: 4,
  },
  closeText: {},
  content: {
    maxHeight: height * 0.6,
  },
  footer: {},
});
