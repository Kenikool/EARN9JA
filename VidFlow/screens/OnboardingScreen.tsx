import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import {
  WelcomeIllustration,
  BrowseIllustration,
  DownloadIllustration,
  WatchIllustration,
} from "../assets/illustrations";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  Illustration: React.FC<{ size?: number }>;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Welcome to VidFlow",
    description:
      "Download and watch your favorite videos offline anytime, anywhere",
    Illustration: WelcomeIllustration,
  },
  {
    id: 2,
    title: "Browse & Discover",
    description:
      "Search and explore millions of videos from your favorite creators",
    Illustration: BrowseIllustration,
  },
  {
    id: 3,
    title: "Download Easily",
    description: "Save videos in multiple qualities for offline viewing",
    Illustration: DownloadIllustration,
  },
  {
    id: 4,
    title: "Watch Anytime",
    description: "Enjoy your downloaded videos without internet connection",
    Illustration: WatchIllustration,
  },
];

interface Props {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    // Slide animation when index changes
    Animated.spring(slideAnim, {
      toValue: currentIndex,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, slideAnim]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
  };

  const translateX = slideAnim.interpolate({
    inputRange: slides.map((_, i) => i),
    outputRange: slides.map((_, i) => -i * SCREEN_WIDTH),
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.View
        style={[
          styles.slidesContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {slides.map((slide) => {
          const { Illustration } = slide;
          return (
            <View key={slide.id} style={styles.slide}>
              <View style={styles.illustrationContainer}>
                <Illustration size={280} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </View>
          );
        })}
      </Animated.View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDotPress(index)}
            style={[styles.dot, index === currentIndex && styles.activeDot]}
          />
        ))}
      </View>

      {/* Next/Get Started button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
  },
  slidesContainer: {
    flexDirection: "row",
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2196F3",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#2196F3",
    width: 30,
  },
  button: {
    marginHorizontal: 40,
    marginBottom: 50,
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
