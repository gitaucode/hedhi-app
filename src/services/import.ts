import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { defaults, Flow, Mood, Snapshot, Symptom } from "../types";
import { validDate } from "../utils/dates";

const flows: Flow[] = ["none", "spotting", "light", "medium", "heavy"];
const moods: Mood[] = ["happy", "calm", "tired", "irritable", "sad", "anxious"];
const symptoms: Symptom[] = [
  "cramps",
  "bloating",
  "headache",
  "tenderness",
  "acne",
  "backache",
];
const discharges = ["none", "dry", "sticky", "creamy", "watery", "eggwhite"];

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

export function parseImport(contents: string): Snapshot {
  const raw: unknown = JSON.parse(contents);
  if (!record(raw) || raw.format !== "hedhi" || raw.version !== 1) throw new Error("format");
  if (!record(raw.settings) || !Array.isArray(raw.periods) || !Array.isArray(raw.logs))
    throw new Error("shape");

  const settings = { ...defaults, ...raw.settings } as Snapshot["settings"];
  if (
    typeof settings.name !== "string" ||
    !["en", "sw"].includes(settings.language) ||
    !Number.isInteger(settings.cycleLength) ||
    settings.cycleLength < 15 ||
    settings.cycleLength > 90 ||
    !Number.isInteger(settings.periodLength) ||
    settings.periodLength < 1 ||
    settings.periodLength > 15 ||
    settings.periodLength >= settings.cycleLength ||
    !Number.isInteger(settings.reminderHour) ||
    settings.reminderHour < 0 ||
    settings.reminderHour > 23 ||
    typeof settings.onboarded !== "boolean" ||
    typeof settings.showFertility !== "boolean" ||
    typeof settings.demo !== "boolean" ||
    typeof settings.reminder !== "boolean"
  )
    throw new Error("settings");

  const periods = raw.periods.map((entry) => {
    if (
      !record(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.start !== "string" ||
      !validDate(entry.start) ||
      !(entry.end === null || (typeof entry.end === "string" && validDate(entry.end))) ||
      (typeof entry.end === "string" && entry.end < entry.start) ||
      typeof entry.createdAt !== "string" ||
      typeof entry.updatedAt !== "string"
    )
      throw new Error("period");
    return entry as unknown as Snapshot["periods"][number];
  });
  const orderedPeriods = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  for (let index = 1; index < orderedPeriods.length; index++) {
    if (orderedPeriods[index].start <= (orderedPeriods[index - 1].end ?? "9999-12-31"))
      throw new Error("overlap");
  }

  const logs = raw.logs.map((entry) => {
    if (
      !record(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.date !== "string" ||
      !validDate(entry.date) ||
      typeof entry.flow !== "string" ||
      !flows.includes(entry.flow as Flow) ||
      !strings(entry.moods) ||
      !entry.moods.every((mood) => moods.includes(mood as Mood)) ||
      !strings(entry.symptoms) ||
      !entry.symptoms.every((symptom) => symptoms.includes(symptom as Symptom)) ||
      !Number.isInteger(entry.pain) ||
      (entry.pain as number) < 0 ||
      (entry.pain as number) > 10 ||
      !Number.isInteger(entry.energy) ||
      (entry.energy as number) < 1 ||
      (entry.energy as number) > 5 ||
      !(entry.sleep === null ||
        (typeof entry.sleep === "number" && entry.sleep >= 0 && entry.sleep <= 24)) ||
      typeof entry.discharge !== "string" ||
      !discharges.includes(entry.discharge) ||
      typeof entry.notes !== "string" ||
      typeof entry.createdAt !== "string" ||
      typeof entry.updatedAt !== "string"
    )
      throw new Error("log");
    return entry as unknown as Snapshot["logs"][number];
  });

  if (new Set(periods.map((entry) => entry.id)).size !== periods.length) throw new Error("periods");
  if (new Set(logs.map((entry) => entry.id)).size !== logs.length) throw new Error("logs");
  if (new Set(logs.map((entry) => entry.date)).size !== logs.length) throw new Error("dates");
  return { settings, periods, logs };
}

export async function pickImport(): Promise<Snapshot | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (asset.size && asset.size > 5_000_000) throw new Error("size");
  const contents =
    process.env.EXPO_OS === "web" && asset.file
      ? await asset.file.text()
      : await new File(asset.uri).text();
  return parseImport(contents);
}
