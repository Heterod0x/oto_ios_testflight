import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type EmptyStateProps = {
  title: string;
  description?: string;
  cta?: React.ReactNode;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  cta: {
    marginTop: spacing.lg,
  },
});

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  cta,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {cta ? <View style={styles.cta}>{cta}</View> : null}
  </View>
);
