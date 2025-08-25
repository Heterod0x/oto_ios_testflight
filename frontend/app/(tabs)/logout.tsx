import { navigateToTabs } from '@/lib/session';
import { useAuth } from '@/lib/oto-auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      await logout();
      navigateToTabs('/login');
    })();
  }, [logout]);
}
