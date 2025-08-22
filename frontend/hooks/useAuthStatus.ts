import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/oto-auth';
import { hasSession } from '@/lib/session';

export const useAuthStatus = () => {
  const { user, isReady } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (isReady) {
      // Check if user is authenticated through Privy
      const privyLoggedIn = !!user;

      // Check if user is authenticated through wallet
      const walletLoggedIn = hasSession();

      setIsLoggedIn(!!(privyLoggedIn || walletLoggedIn));
    }
  }, [user, isReady]);

  return { isLoggedIn, isReady };
};
