import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";

type AvatarProps = {
  name: string;
  color: string;
  size?: number;
  photoUrl?: string | null;
  style?: ViewStyle;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

const getInitials = (name: string) => {
  const [first, second] = name.trim().split(" ");
  if (first && second) {
    return `${first[0]}${second[0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color,
  size = 56,
  photoUrl,
  style,
}) => {
  const dimensionStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  const textStyle = {
    fontSize: size / 2.8,
  };

  return (
    <View style={[styles.container, dimensionStyle, style]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.initials, textStyle]}>{getInitials(name)}</Text>
      )}
    </View>
  );
};
