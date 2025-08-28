import { useEffect, useState, useCallback } from 'react';
import { fetchConversation } from '@/services/api';
import { ConversationDTO } from '@/types/conversation';
import { useAuth } from '@/lib/oto-auth';

export default function useConversation(conversationId: string) {
  const { user, getAccessToken } = useAuth();
  const [data, setData] = useState<ConversationDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = (await getAccessToken()) || '';
      const res = await fetchConversation(conversationId, user.id, token);
      console.log('converstion called');
      setData(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user, conversationId, getAccessToken]);

  useEffect(() => {
    if (!user) return;
    let canceled = false;

    const initialLoad = async () => {
      load();
    };

    initialLoad();
    return () => {
      canceled = true;
    };
  }, [user, conversationId]);

  return { data, loading, error, refetch: load };
}
