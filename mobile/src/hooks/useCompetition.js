import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";

/**
 * Loads a competition and keeps it "live":
 *  - re-fetches on a short interval so spotsLeft / lifecycle state stay
 *    correct if another user registers or a deadline passes while this
 *    screen is open.
 *  - tracks the gap between server time and device time once, so the
 *    on-screen countdown ticks locally every second without spamming the
 *    API, but still can't be fooled by a wrong device clock.
 */
export function useCompetition(competitionId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionPending, setActionPending] = useState(false);
  const clockOffsetRef = useRef(0); // serverTime - deviceTime, in ms

  const fetchCompetition = useCallback(async () => {
    try {
      setError(null);
      const result = await api.getCompetition(competitionId);
      clockOffsetRef.current = new Date(result.serverTime).getTime() - Date.now();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load competition");
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    fetchCompetition();
    const interval = setInterval(fetchCompetition, 30000); // background refresh
    return () => clearInterval(interval);
  }, [fetchCompetition]);

  const register = useCallback(async () => {
    setActionPending(true);
    try {
      await api.register(competitionId);
      await fetchCompetition();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message, code: err.code };
    } finally {
      setActionPending(false);
    }
  }, [competitionId, fetchCompetition]);

  const submit = useCallback(
    async (fileUrl, fileType) => {
      setActionPending(true);
      try {
        await api.submitEntry(competitionId, fileUrl, fileType);
        await fetchCompetition();
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err.message, code: err.code };
      } finally {
        setActionPending(false);
      }
    },
    [competitionId, fetchCompetition]
  );

  // Approximate "now" corrected for server/device clock skew.
  const getCorrectedNow = useCallback(() => Date.now() + clockOffsetRef.current, []);

  return { data, loading, error, actionPending, register, submit, refresh: fetchCompetition, getCorrectedNow };
}
