import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-root-toast";

import { FriendCard } from "../components/FriendCard";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import { useFriends } from "../contexts/FriendsContext";
import { useCall } from "../contexts/CallContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { FriendProfile } from "../types";
import type { RootTabParamList } from "../navigation/types";

type FriendsTabNav = BottomTabNavigationProp<RootTabParamList, "Friends">;

export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<FriendsTabNav>();
  const { user } = useAuth();
  const { friends, isLoading, addFriendById } = useFriends();
  const { callStatus, currentSession, startCall } = useCall();
  const [friendIdInput, setFriendIdInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const handleCopyMyId = useCallback(async () => {
    const value = user?.id;
    if (!value) {
      return;
    }
    try {
      await Clipboard.setStringAsync(value);
      Toast.show("IDをコピーしました", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (copyError) {
      console.warn("Failed to copy ID", copyError);
    }
  }, [user?.id]);

  const sortedFriends = useMemo(
    () =>
      friends.slice().sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      ),
    [friends]
  );

  const handleAddFriend = async () => {
    setError(null);
    try {
      setAdding(true);
      await addFriendById(friendIdInput);
      setFriendIdInput("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "フレンドの追加に失敗しました。";
      setError(message);
    } finally {
      setAdding(false);
    }
  };

  const handleSelectFriend = async (friend: FriendProfile) => {
    if (callStatus !== "idle") {
      Alert.alert("通話中", "現在ほかの通話中です。通話画面を確認してください。");
      return;
    }
    if (!friend.roomId) {
      setCallError(
        "通話ルームがまだ準備できていません。しばらく待ってから再試行してください。"
      );
      return;
    }
    setCallError(null);
    navigation.navigate("ActiveCall");
    try {
      await startCall(friend);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "通話の開始に失敗しました。";
      setCallError(message);
      navigation.navigate("Friends");
    }
  };

  const renderItem = ({ item }: { item: FriendProfile }) => {
    const isCurrentSession =
      callStatus !== "idle" && currentSession?.friend.id === item.id;
    const remoteActive =
      !!item.activeCall && item.activeCall.peerId === user?.id;
    const isInCallWithYou = isCurrentSession || remoteActive;
    const isWaitingForYou = item.waiting === true;
    return (
      <FriendCard
        friend={item}
        isInCallWithYou={isInCallWithYou}
        isWaiting={isWaitingForYou}
        onPress={() => handleSelectFriend(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={sortedFriends}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>フレンドリスト</Text>
            <View style={styles.addFriendContainer}>
              <Text style={styles.label}>フレンドIDを入力</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="例: abCdEf123"
                  placeholderTextColor={colors.textSecondary}
                  value={friendIdInput}
                  onChangeText={setFriendIdInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.addButtonWrapper}>
                  <PrimaryButton
                    title="追加"
                    onPress={handleAddFriend}
                    disabled={!friendIdInput.trim() || adding}
                    loading={adding}
                  />
                </View>
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                style={({ pressed }) => [
                  styles.myIdContainer,
                  pressed && user?.id && styles.myIdContainerPressed,
                ]}
                onPress={handleCopyMyId}
                disabled={!user?.id}
              >
                <Text style={styles.myIdLabel}>あなたのID (タップしてコピー)</Text>
                <Text style={styles.myIdValue}>{user?.id ?? "-"}</Text>
              </Pressable>
            </View>
            {callError ? <Text style={styles.error}>{callError}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primaryLight} />
          ) : (
            <EmptyState
              title="フレンドがまだいません"
              description="あなたのIDを友だちに共有するか、フレンドのIDを入力して通話を始めましょう。"
              cta={
                <PrimaryButton
                  title="フレンド追加"
                  onPress={handleAddFriend}
                  disabled={!friendIdInput.trim() || adding}
                  loading={adding}
                />
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  addFriendContainer: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.lg,
    borderRadius: 24,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    marginRight: spacing.sm,
  },
  addButtonWrapper: {
    minWidth: 100,
  },
  myIdContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  myIdContainerPressed: {
    opacity: 0.8,
  },
  myIdLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  myIdValue: {
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  copyHint: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 11,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
    fontSize: 13,
  },
});
