import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import type { JobState } from "./types";

/** Chargement d'une ressource avec rechargement manuel. */
export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      setData(await api.get<T>(path));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload, setData };
}

/** Suivi d'un job asynchrone (polling avec backoff léger). */
export function useJob<R>(workspacePath: string) {
  const [job, setJob] = useState<JobState<R> | null>(null);
  const [running, setRunning] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  const track = useCallback(
    async (jobId: string): Promise<JobState<R>> => {
      setRunning(true);
      let delay = 600;
      try {
        for (;;) {
          const state = await api.get<JobState<R>>(`${workspacePath}/jobs/${jobId}`);
          if (cancelled.current) return state;
          setJob(state);
          if (!["QUEUED", "RUNNING"].includes(state.status)) return state;
          await new Promise((r) => setTimeout(r, delay));
          delay = Math.min(delay * 1.4, 3000);
        }
      } finally {
        setRunning(false);
      }
    },
    [workspacePath],
  );
  return { job, running, track, reset: () => setJob(null) };
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return e instanceof Error ? e.message : "Une erreur est survenue";
}
