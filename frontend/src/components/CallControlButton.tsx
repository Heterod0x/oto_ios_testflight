import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../theme/colors";

type CallControlVariant = "default" | "danger" | "mute";

type CallControlButtonProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void | Promise<void>;
  variant?: CallControlVariant;
  active?: boolean;
};

const styles = StyleSheet.create({
  container: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.surfaceAlt}AA`,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  muteActive: {
    backgroundColor: colors.primary,
  },
});

export const CallControlButton: React.FC<CallControlButtonProps> = ({
  icon,
  onPress,
  variant = "default",
  active = false,
}) => {
  const containerStyle = [
    styles.container,
    variant === "danger" && styles.danger,
    variant === "mute" && active && styles.muteActive,
  ];
  const iconColor =
    variant === "danger" ? "#fff" : active ? "#fff" : colors.textPrimary;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.8 }}>
      <View style={containerStyle}>
        <Feather name={icon} size={24} color={iconColor} />
      </View>
    </Pressable>
  );
};
