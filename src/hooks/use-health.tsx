import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AppState } from "react-native";
import { randomUUID } from "expo-crypto";
import { repository } from "../repositories/health";
import { CheckIn, defaults, Period, Settings, Snapshot } from "../types";
import { translate, TextKey } from "../locales";
import { addDays, today } from "../utils/dates";
import { lockEnabled, clearLock } from "../services/privacy";
import { scheduleReminder } from "../services/reminders";
const initial: Snapshot = { settings: defaults, periods: [], logs: [] };
export const metadata = () => {
  const now = new Date().toISOString();
  return { id: randomUUID(), createdAt: now, updatedAt: now };
};
function useHealthState() {
  const [data, setData] = useState(initial),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false),
    [locked, setLocked] = useState(false),
    [lock, setLockState] = useState(false),
    [editingDate, setEditingDate] = useState(today()),
    [editingPeriod, setEditingPeriod] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setData(await repository.load());
  }, []);
  const initialize = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const enabled = await lockEnabled();
      setLockState(enabled);
      setLocked(enabled);
      await refresh();
    } catch (e) {
      console.error("Initialization failed:", e);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [refresh]);
  useEffect(() => {
    void initialize();
  }, [initialize]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" && lock) setLocked(true);
    });
    return () => sub.remove();
  }, [lock]);
  const t = useCallback(
    (key: TextKey, values?: Record<string, string | number>) =>
      translate(data.settings.language, key, values),
    [data.settings.language],
  );
  const saveSettings = async (settings: Settings) => {
    await repository.saveSettings(settings);
    await refresh();
  };
  const savePeriod = async (p: Period) => {
    await repository.savePeriod({ ...p, updatedAt: new Date().toISOString() });
    await refresh();
  };
  const saveLog = async (l: CheckIn) => {
    await repository.saveCheckIn({ ...l, updatedAt: new Date().toISOString() });
    await refresh();
  };
  const erase = async () => {
    await scheduleReminder({ ...defaults, reminder: false });
    await repository.clear();
    await clearLock();
    setLockState(false);
    setLocked(false);
    await refresh();
  };
  const demo = async () => {
    await repository.clear();
    const now = today();
    for (const offset of [-99, -70, -40, -11])
      await repository.savePeriod({
        ...metadata(),
        start: addDays(now, offset),
        end: addDays(now, offset + 4),
      });
    for (let i = 0; i < 21; i++)
      await repository.saveCheckIn({
        ...metadata(),
        date: addDays(now, -i),
        flow: i >= 7 && i <= 11 ? "medium" : "none",
        moods: [i % 3 === 0 ? "tired" : "calm"],
        symptoms: i % 4 === 0 ? ["cramps"] : i % 5 === 0 ? ["headache"] : [],
        pain: i % 4 === 0 ? 3 : 0,
        energy: (i % 3) + 2,
        sleep: 7 + (i % 3) * 0.5,
        discharge: "none",
        notes: "",
      });
    await saveSettings({
      ...defaults,
      onboarded: true,
      demo: true,
      name: "Amani",
      language: data.settings.language,
    });
  };
  return {
    ...data,
    loading,
    failed,
    locked,
    setLocked,
    lock,
    setLockState,
    t,
    refresh,
    initialize,
    saveSettings,
    savePeriod,
    saveLog,
    erase,
    demo,
    restore: async (snapshot: Snapshot) => {
      await repository.replace(snapshot);
      try {
        await scheduleReminder(snapshot.settings);
      } catch {
        // The restored data remains valid if the OS declines reminder scheduling.
      }
      await refresh();
    },
    editingDate,
    setEditingDate,
    editingPeriod,
    setEditingPeriod,
    deleteLog: async (id: string) => {
      await repository.deleteCheckIn(id);
      await refresh();
    },
    deletePeriod: async (id: string) => {
      await repository.deletePeriod(id);
      await refresh();
    },
  };
}
const Context = createContext<ReturnType<typeof useHealthState> | null>(null);
export function HealthProvider({ children }: { children: React.ReactNode }) {
  const value = useHealthState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useHealth() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing provider");
  return value;
}
