import * as SecureStore from 'expo-secure-store';

export const hasSession = () => {
  const walletToken = SecureStore.getItem('wallet_token');
  const walletAddress = SecureStore.getItem('wallet_address');
  return walletToken && walletAddress;
};
