import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FriendsProvider } from "./contexts/FriendsContext";
import { CallProvider } from "./contexts/CallContext";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { RootNavigator } from "./navigation/RootNavigator";
import { colors } from "./theme/colors";

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={colors.primaryLight} size="large" />
      </View>
    );
  }

  if (!user) {
    return <OnboardingScreen />;
  }

  return (
    <FriendsProvider>
      <CallProvider>
        <RootNavigator />
      </CallProvider>
    </FriendsProvider>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <StatusBar style="light" />
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
