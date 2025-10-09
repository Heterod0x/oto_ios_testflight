import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export const OnboardingScreen: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    try {
      setLoading(true);
      await register(name);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "登録に失敗しました。";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.surface, colors.background]}
      style={StyleSheet.absoluteFill}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>ようこそ</Text>
            <Text style={styles.subtitle}>
              あなたが通話をすることで、次のAIはもっと進化する。
            </Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>お名前</Text>
            <TextInput
              style={styles.input}
              placeholder="Taro"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
          <PrimaryButton
            title="スタート"
            onPress={handleRegister}
            disabled={!name.trim()}
            loading={loading}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  form: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: 13,
  },
});
