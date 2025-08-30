import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchConversations } from '@/services/api';
import { ConversationDTO } from '@/types/conversation';
import { useAuth } from '@/lib/oto-auth';

export default function useConversations() {
  const { user, getAccessToken } = useAuth();
  const [data, setData] = useState<ConversationDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const token = (await getAccessToken()) || '';
      const conversations = await fetchConversations(user.id, token);
      setData(conversations);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user, getAccessToken]);

  // Refetch data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  return { data, loading, error };
}
