import { useAuth } from '@/lib/oto-auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);
}
