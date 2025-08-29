import { Platform } from 'react-native';
import { Href, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export const hasSession = async (): Promise<boolean> => {
  try {
    const walletToken = await SecureStore.getItemAsync('wallet_token');
    const walletAddress = await SecureStore.getItemAsync('wallet_address');
    return !!(walletToken && walletAddress);
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

// Helper function for robust navigation on iOS mobile device
export const navigateToTabs = (href: Href) => {
  const navigate = () => {
    try {
      router.push(href);
    } catch (error) {
      // Fallback: try replace instead of push
      try {
        router.replace(href);
      } catch (pushError) {
        console.error('Push navigation also failed:', pushError);
      }
    }
  };

  navigate();
};
