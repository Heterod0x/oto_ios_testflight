import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 999,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
});

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
}) => {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
};
