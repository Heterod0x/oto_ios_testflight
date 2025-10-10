import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { Avatar } from "../components/Avatar";
import { SecondaryButton } from "../components/SecondaryButton";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { CallHistoryEntry } from "../types";
import { db } from "../services/firebase";
import { formatDateTime, formatDuration } from "../utils/time";

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<CallHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoadingHistory(false);
      return;
    }

    const historyRef = collection(db, "users", user.id, "callHistory");
    const historyQuery = query(
      historyRef,
      orderBy("startedAt", "desc"),
      limit(25)
    );

    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const items: CallHistoryEntry[] = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as any;
        return {
          id: docSnapshot.id,
          peerId: data.peerId,
          peerName: data.peerName,
          startedAt: typeof data.startedAt === "number" ? data.startedAt : 0,
          endedAt: typeof data.endedAt === "number" ? data.endedAt : 0,
          durationSeconds:
            typeof data.durationSeconds === "number" ? data.durationSeconds : 0,
          pointsEarned:
            typeof data.pointsEarned === "number" ? data.pointsEarned : 0,
        };
      });
      setHistory(items);
      setLoadingHistory(false);
    });

    return unsubscribe;
  }, [user?.id]);

  if (!user) {
    return null;
  }

  return (
    <LinearGradient
      colors={[colors.surface, colors.background]}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          contentContainerStyle={styles.content}
          data={history}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <View style={styles.profileRow}>
                <Avatar
                  name={user.name}
                  color={user.avatarColor}
                  photoUrl={user.photoUrl}
                  size={80}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.identifier}>ID: {user.id}</Text>
                </View>
              </View>
              <View style={styles.pointsCard}>
                <Text style={styles.pointsLabel}>ポイント残高</Text>
                <Text style={styles.pointsValue}>{user.points}</Text>
                <Text style={styles.pointsCaption}>
                  通話を行うことでポイントが貯まります。
                </Text>
                <Text style={styles.pointsCaption}>
                  v1.0.1
                </Text>
              </View>
              <View style={styles.logoutButton}>
                <SecondaryButton
                  title="ログアウト"
                  onPress={logout}
                  danger
                />
              </View>
              <Text style={styles.historyHeading}>通話履歴</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyRow}>
                <Text style={styles.historyName}>{item.peerName}</Text>
                <Text style={styles.historyDuration}>
                  {formatDuration(item.durationSeconds)}
                </Text>
              </View>
              <Text style={styles.historyDate}>
                {item.startedAt ? formatDateTime(item.startedAt) : "-"}
              </Text>
              <Text style={styles.historyPoints}>
                +{item.pointsEarned} pt
              </Text>
            </View>
          )}
          ListEmptyComponent={
            loadingHistory ? (
              <ActivityIndicator color={colors.primaryLight} />
            ) : (
              <Text style={styles.emptyHistory}>
                まだ通話履歴がありません。
              </Text>
            )
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: spacing.lg,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  identifier: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
  },
  pointsCard: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.lg,
    borderRadius: 24,
    marginTop: spacing.lg,
  },
  pointsLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  pointsValue: {
    marginTop: spacing.xs,
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pointsCaption: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
  },
  historyHeading: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  historyItem: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  historyDuration: {
    color: colors.textPrimary,
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  historyDate: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  historyPoints: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: "600",
  },
  emptyHistory: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
