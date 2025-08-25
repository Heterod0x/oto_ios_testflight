import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/oto-auth';
import { hasSession } from '@/lib/session';

export const useAuthStatus = () => {
  const { user, isReady } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isReady) {
        try {
          // Check if user is authenticated through Privy
          const privyLoggedIn = !!user;

          // Check if user is authenticated through wallet
          const walletLoggedIn = await hasSession();

          const loggedIn = !!(privyLoggedIn || walletLoggedIn);
          setIsLoggedIn(loggedIn);
        } catch (error) {
          console.error('Error checking auth status:', error);
          setIsLoggedIn(false);
        }
      }
    };

    checkAuthStatus();
  }, [user, isReady]);

  return { isLoggedIn, isReady };
};
