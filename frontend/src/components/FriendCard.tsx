import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import type { FriendProfile } from "../types";
import { Avatar } from "./Avatar";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type FriendCardProps = {
  friend: FriendProfile;
  isInCallWithYou: boolean;
  isWaiting?: boolean;
  onPress: () => void;
  containerStyle?: ViewStyle;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.md,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
  },
  identifier: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  trailing: {
    marginLeft: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  callBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primaryLight}33`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  callBadgeText: {
    color: colors.primaryLight,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  waitingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.accent}26`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  waitingBadgeText: {
    color: colors.accent,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
});

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  isInCallWithYou,
  isWaiting,
  onPress,
  containerStyle,
}) => {
  const showWaiting = isWaiting && !isInCallWithYou;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        containerStyle,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Avatar
        name={friend.name}
        color={friend.avatarColor}
        photoUrl={friend.photoUrl}
        size={56}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.identifier} numberOfLines={1}>ID: {friend.id}</Text>
        {showWaiting && (
          <View style={styles.waitingBadge}>
            <Feather name="clock" size={14} color={colors.accent} />
            <Text style={styles.waitingBadgeText}>相手が待機しています</Text>
          </View>
        )}
        {isInCallWithYou && (
          <View style={styles.callBadge}>
            <Feather name="phone-call" size={14} color={colors.primaryLight} />
            <Text style={styles.callBadgeText}>通話中</Text>
          </View>
        )}
      </View>
      <View style={styles.trailing}>
        <Feather name="chevron-right" size={22} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
};
