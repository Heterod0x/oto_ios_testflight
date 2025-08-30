import { syncPoints } from '@/services/api';

export const syncPointsOnServerSide = async (id: string, token: string) => {
  try {
    const res = await syncPoints(id, token);
    return !!res.success;
  } catch (err) {
    const errorMsg = JSON.stringify(err);

    const message = err instanceof Error ? err.message : errorMsg;

    throw new Error(`Sync points failed: ${message}`);
  }
};
