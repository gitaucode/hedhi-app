export type Language = "en" | "sw";
export interface RecordMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
}
export interface Period extends RecordMeta {
  start: string;
  end: string | null;
}
export type Flow = "none" | "spotting" | "light" | "medium" | "heavy";
export type Mood = "happy" | "calm" | "tired" | "irritable" | "sad" | "anxious";
export type Symptom =
  "cramps" | "bloating" | "headache" | "tenderness" | "acne" | "backache";
export interface CheckIn extends RecordMeta {
  date: string;
  flow: Flow;
  moods: Mood[];
  symptoms: Symptom[];
  pain: number;
  energy: number;
  sleep: number | null;
  discharge: "none" | "dry" | "sticky" | "creamy" | "watery" | "eggwhite";
  notes: string;
}
export interface Settings {
  name: string;
  language: Language;
  cycleLength: number;
  periodLength: number;
  onboarded: boolean;
  showFertility: boolean;
  demo: boolean;
  reminder: boolean;
  reminderHour: number;
}
export interface Snapshot {
  settings: Settings;
  periods: Period[];
  logs: CheckIn[];
}
export const defaults: Settings = {
  name: "",
  language: "en",
  cycleLength: 28,
  periodLength: 5,
  onboarded: false,
  showFertility: true,
  demo: false,
  reminder: false,
  reminderHour: 20,
};
export interface HealthRepository {
  load(): Promise<Snapshot>;
  saveSettings(settings: Settings): Promise<void>;
  savePeriod(period: Period): Promise<void>;
  deletePeriod(id: string): Promise<void>;
  saveCheckIn(log: CheckIn): Promise<void>;
  deleteCheckIn(id: string): Promise<void>;
  replace(snapshot: Snapshot): Promise<void>;
  clear(): Promise<void>;
}
// Future adapters must be explicitly enabled; no network implementation exists in this phase.
export interface SyncService {
  sync(): Promise<void>;
}
export interface AuthService {
  signOut(): Promise<void>;
}
