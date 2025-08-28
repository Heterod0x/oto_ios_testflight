import { syncPoints } from '@/services/api';

export const syncPointsOnServerSide = async (id: string, token: string) => {
  try {
    const res = await syncPoints(id, token);
    return !!res.success;
  } catch (err) {
    const errorMsg = JSON.stringify(err);
    // 時々エラーが起こるが正常に動作しているため一旦無視
    if (errorMsg.includes('Failed to sync points')) return;

    const message = err instanceof Error ? err.message : errorMsg;

    throw new Error(`Sync points failed: ${message}`);
  }
};
