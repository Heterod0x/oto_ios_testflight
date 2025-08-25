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
      console.log('Attempting navigation to tabs');
      router.replace(href);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback: try push instead of replace
      try {
        router.push(href);
      } catch (pushError) {
        console.error('Push navigation also failed:', pushError);
      }
    }
  };

  // Use platform-specific timing for iOS mobile device
  const delay = Platform.OS === 'ios' ? 200 : 100;
  setTimeout(navigate, delay);
};
