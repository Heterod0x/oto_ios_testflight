import { Redirect } from 'expo-router';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function Index() {
  const { isLoggedIn, isReady } = useAuthStatus();

  // Show loading while checking auth status
  if (!isReady || isLoggedIn === null) {
    return null;
  }
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/login" />;
  }
}
