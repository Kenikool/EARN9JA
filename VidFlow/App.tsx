import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ui";
import { SplashScreen } from "./assets/images";
import { OnboardingScreen } from "./screens";
import { MainNavigator } from "./navigation/MainNavigator";
import { useAppStore } from "./store/appStore";

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { hasSeenOnboarding, setHasSeenOnboarding } = useAppStore();

  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <SplashScreen onAnimationComplete={() => setIsLoading(false)} />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!hasSeenOnboarding ? (
              <Stack.Screen name="Onboarding">
                {() => (
                  <OnboardingScreen
                    onComplete={() => setHasSeenOnboarding(true)}
                  />
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Main" component={MainNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
