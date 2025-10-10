import React, { useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DefaultTheme, NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { FriendsScreen } from "../screens/FriendsScreen";
import { ActiveCallScreen } from "../screens/ActiveCallScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme/colors";
import type { RootTabParamList } from "./types";
import { useCall } from "../contexts/CallContext";
import { useProximity } from "expo-proximity";

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator: React.FC = () => {
  const { callStatus } = useCall();
  const inCall = callStatus !== "idle";
  const { proximityState } = useProximity();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.tabBar,
      text: colors.textPrimary,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopWidth: 0,
            paddingVertical: 6,
            height:86,
            paddingTop: 6,
            opacity: proximityState && route.name === "ActiveCall" ? 0 : 1,
          },
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          tabBarIcon: ({ color, size }) => {
            const iconName = (() => {
              switch (route.name) {
                case "Friends":
                  return "users";
                case "ActiveCall":
                  return "phone-call";
                case "Profile":
                  return "user";
                default:
                  return "circle";
              }
            })();
            return <Feather name={iconName} size={size} color={color}  />;
          },
        })}
      >
        <Tab.Screen
          name="Friends"
          component={FriendsScreen}
          options={{ title: "フレンドリスト" }}
        />
        <Tab.Screen
          name="ActiveCall"
          component={ActiveCallScreen}
          options={{
            title: "通話中",
            tabBarBadge: inCall ? "●" : undefined,
            tabBarBadgeStyle: {
              backgroundColor: "transparent",
              color: colors.primaryLight,
              fontSize: 14,
            },
            sceneStyle: {
              opacity: proximityState ? 0 : 1,
            }
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "プロフィール" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
