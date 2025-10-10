import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Button,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { Avatar } from "../components/Avatar";
import { CallControlButton } from "../components/CallControlButton";
import { EmptyState } from "../components/EmptyState";
import { useCall } from "../contexts/CallContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useCallTimer } from "../hooks/useCallTimer";
import { formatDuration } from "../utils/time";
import { useProximity } from "expo-proximity";
import { StatusBar } from "expo-status-bar";

const statusLabelMap = {
  idle: "待機中",
  connecting: "接続中…",
  connected: "通話中",
  ending: "終了中…",
} as const;

export const ActiveCallScreen: React.FC = () => {
  const {
    callStatus,
    currentSession,
    remoteParticipantCount,
    isMuted,
    toggleMute,
    endCall,
  } = useCall();
  const { proximityState } = useProximity();

  const elapsedSeconds = useCallTimer(
    currentSession?.startedAt ?? null,
    callStatus
  );

  if (!currentSession) {
    return (
      <LinearGradient
        colors={[colors.surface, colors.background]}
        style={StyleSheet.absoluteFill}
      >
        <SafeAreaView style={styles.safeAreaCentered}>
          <EmptyState
            title="まだ通話がありません"
            description="フレンドタブから通話したい相手を選んでください。"
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const friend = currentSession?.friend ?? {
    id: "123",
    name: "テストユーザー",
    avatarColor: "red",
    photoUrl: "https://via.placeholder.com/150",
    roomId: "123",
    waiting: false,
    createdAt: 1718035200,
  };
  const statusLabel = statusLabelMap[callStatus];
  const remoteStatusText =
    remoteParticipantCount > 0
      ? "お互いに接続されています"
      : callStatus === "connected"
      ? "相手の参加を待っています…"
      : "準備しています...";
    
  
  if (proximityState) {
    return <View style={{ backgroundColor: "black", flex: 1 }}>
      <StatusBar hidden={true}/>
    </View>;
  }

  return (
    <LinearGradient
      colors={[colors.surface, colors.background]}
      style={[StyleSheet.absoluteFill]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.topContent}>
            <Avatar
              name={friend.name}
              color={friend.avatarColor}
              photoUrl={friend.photoUrl}
              size={120}
            />
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.status}>{statusLabel}</Text>
            <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
            <Text style={styles.remoteStatus}>{remoteStatusText}</Text>
          </View>
          <View style={styles.controls}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <CallControlButton
                icon={isMuted ? "mic-off" : "mic"}
                onPress={toggleMute}
                variant="mute"
                active={isMuted}
              />
              {/*
              <Pressable>
                <Feather style={{marginLeft: 8}} name="chevron-down" size={24} color={colors.textSecondary}/>
              </Pressable>
              */}
            </View>
            <CallControlButton
              icon="phone-off"
              onPress={endCall}
              variant="danger"
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    justifyContent: "space-between",
  },
  topContent: {
    alignItems: "center",
  },
  friendName: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  status: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  timer: {
    marginTop: spacing.lg,
    fontSize: 36,
    fontVariant: ["tabular-nums"],
    color: colors.textPrimary,
    fontWeight: "600",
  },
  remoteStatus: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  controls: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.xl,
  },
});
