import { useEffect, useState } from "react";

import type { CallStatus } from "../types";

export const useCallTimer = (
  startedAt: number | null,
  status: CallStatus
): number => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const update = () => {
      setElapsed(Math.max(Math.floor((Date.now() - startedAt) / 1000), 0));
    };
    update();
    if (status === "connecting" || status === "connected") {
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    }
    if (status === "idle") {
      setElapsed(0);
    }
    return () => undefined;
  }, [startedAt, status]);

  return elapsed;
};
