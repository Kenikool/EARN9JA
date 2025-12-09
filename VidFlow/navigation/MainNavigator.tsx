import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon, useTheme } from "../components/ui";

// Import screens
import {
  HomeScreen,
  SearchScreen,
  DownloadsScreen,
  SettingsScreen,
  VideoDetailsScreen,
  FavoritesScreen,
  HistoryScreen,
} from "../screens";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VideoDetails"
        component={VideoDetailsScreen}
        options={{
          title: "Video Details",
        }}
      />
    </Stack.Navigator>
  );
}

// Search Stack
function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchMain"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VideoDetails"
        component={VideoDetailsScreen}
        options={{
          title: "Video Details",
        }}
      />
    </Stack.Navigator>
  );
}

// Downloads Stack
function DownloadsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DownloadsMain"
        component={DownloadsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VideoDetails"
        component={VideoDetailsScreen}
        options={{
          title: "Video Details",
        }}
      />
    </Stack.Navigator>
  );
}

// Settings Stack
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favorites",
        }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "Watch History",
        }}
      />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Search":
              iconName = "search";
              break;
            case "Downloads":
              iconName = "download";
              break;
            case "Settings":
              iconName = "settings";
              break;
            default:
              iconName = "home";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Downloads" component={DownloadsStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}
