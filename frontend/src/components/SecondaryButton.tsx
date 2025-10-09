import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type SecondaryButtonProps = {
  title: string;
  onPress: () => void | Promise<void>;
  danger?: boolean;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  danger: {
    borderColor: colors.danger,
  },
  dangerLabel: {
    color: colors.danger,
  },
});

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  danger,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.container,
      danger && styles.danger,
      pressed && { opacity: 0.8 },
    ]}
  >
    <Text style={[styles.label, danger && styles.dangerLabel]}>{title}</Text>
  </Pressable>
);
