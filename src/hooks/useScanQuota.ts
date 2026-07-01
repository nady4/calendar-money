import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../util/api";
import { ScanQuota } from "../types";

const DEFAULT_QUOTA: ScanQuota = {
  usedDay: 0,
  limitDay: 10,
  usedMonth: 0,
  limitMonth: 100,
  resetsAt: "",
};

interface State {
  quota: ScanQuota;
  byok: boolean;
  loading: boolean;
  error: string | null;
}

interface UseScanQuotaResult extends State {
  refresh: () => Promise<void>;
  applyFromResponse: (quota: ScanQuota, byok: boolean) => void;
}

const useScanQuota = (userId: string): UseScanQuotaResult => {
  const [state, setState] = useState<State>({
    quota: DEFAULT_QUOTA,
    byok: false,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!userId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${API_URL}/users/${userId}/scan-quota`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || `Failed to load quota (${response.status})`);
      }
      setState({
        quota: data.quota ?? DEFAULT_QUOTA,
        byok: Boolean(data.byok),
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Could not load scan quota.",
      }));
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const applyFromResponse = useCallback((quota: ScanQuota, byok: boolean) => {
    setState((prev) => ({
      ...prev,
      quota: quota ?? prev.quota,
      byok,
    }));
  }, []);

  return { ...state, refresh, applyFromResponse };
};

export default useScanQuota;
