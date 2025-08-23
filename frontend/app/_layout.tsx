import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import { PrivyProvider, baseSepolia } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { SmartWalletsProvider } from '@privy-io/expo/smart-wallets';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { AuthProvider } from '@/lib/oto-auth';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';

function AppContent() {
  const { isLoading, loadingMessage } = useLoading();

  return (
    <>
      <PrivyProvider
        appId={Constants.expoConfig?.extra?.privyAppId}
        clientId={Constants.expoConfig?.extra?.privyClientId}
        // supportedChains={[baseSepolia]}
        config={{
          embedded: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        <SmartWalletsProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <PrivyElements />
          </AuthProvider>
        </SmartWalletsProvider>
      </PrivyProvider>

      {/* Global Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message={loadingMessage}
        zIndex={9999}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    GeistMono_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <GluestackUIProvider mode="light">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </GluestackUIProvider>
  );
}
