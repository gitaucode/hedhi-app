import * as SQLite from "expo-sqlite";
import { migrations } from "../db/migrations";
import {
  CheckIn,
  defaults,
  HealthRepository,
  Mood,
  Period,
  Settings,
  Symptom,
} from "../types";
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
async function open() {
  if (!connection)
    connection = (async () => {
      const db = await SQLite.openDatabaseAsync("hedhi.db");
      await db.execAsync(
        "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA secure_delete=ON;",
      );
      const version = await db.getFirstAsync<{ user_version: number }>(
        "PRAGMA user_version",
      );
      for (let i = version?.user_version ?? 0; i < migrations.length; i++)
        await db.withTransactionAsync(async () => {
          await db.execAsync(migrations[i]);
          await db.execAsync(`PRAGMA user_version=${i + 1}`);
        });
      return db;
    })().catch((e) => {
      connection = undefined;
      throw e;
    });
  return connection;
}
// Serialize writes so transaction callbacks cannot accidentally absorb concurrent operations.
let queue: Promise<unknown> = Promise.resolve();
function write<T>(job: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  const next = queue.then(async () => job(await open()));
  queue = next.catch(() => {});
  return next;
}
export const repository: HealthRepository = {
  async load() {
    await queue;
    const db = await open();
    const setting = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM settings WHERE id=1",
    );
    const periods = await db.getAllAsync<Period>(
      "SELECT * FROM periods ORDER BY start",
    );
    const rows = await db.getAllAsync<Omit<CheckIn, "moods" | "symptoms">>(
      "SELECT * FROM daily_logs ORDER BY date DESC",
    );
    const moods = await db.getAllAsync<{ logId: string; value: Mood }>(
      "SELECT * FROM moods",
    );
    const symptoms = await db.getAllAsync<{ logId: string; value: Symptom }>(
      "SELECT * FROM symptoms",
    );
    return {
      settings: { ...defaults, ...(setting ? JSON.parse(setting.value) : {}) },
      periods,
      logs: rows.map((r) => ({
        ...r,
        moods: moods.filter((m) => m.logId === r.id).map((m) => m.value),
        symptoms: symptoms.filter((s) => s.logId === r.id).map((s) => s.value),
      })),
    };
  },
  saveSettings(settings) {
    return write(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT OR REPLACE INTO settings(id,value) VALUES(1,?)",
          JSON.stringify(settings),
        );
        await db.runAsync(
          "INSERT OR REPLACE INTO reminders VALUES(?,?,?,?)",
          "daily",
          settings.reminderHour,
          settings.reminder ? 1 : 0,
          new Date().toISOString(),
        );
      });
    });
  },
  savePeriod(p) {
    return write(async (db) => {
      await db.runAsync(
        "INSERT INTO periods VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET start=excluded.start,end=excluded.end,updatedAt=excluded.updatedAt",
        p.id,
        p.start,
        p.end,
        p.createdAt,
        p.updatedAt,
      );
    });
  },
  deletePeriod(id) {
    return write(async (db) => {
      await db.runAsync("DELETE FROM periods WHERE id=?", id);
    });
  },
  saveCheckIn(l) {
    return write(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO daily_logs VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET date=excluded.date,flow=excluded.flow,pain=excluded.pain,energy=excluded.energy,sleep=excluded.sleep,discharge=excluded.discharge,notes=excluded.notes,updatedAt=excluded.updatedAt",
          l.id,
          l.date,
          l.flow,
          l.pain,
          l.energy,
          l.sleep,
          l.discharge,
          l.notes,
          l.createdAt,
          l.updatedAt,
        );
        await db.runAsync("DELETE FROM moods WHERE logId=?", l.id);
        await db.runAsync("DELETE FROM symptoms WHERE logId=?", l.id);
        for (const m of l.moods)
          await db.runAsync("INSERT INTO moods VALUES(?,?)", l.id, m);
        for (const s of l.symptoms)
          await db.runAsync("INSERT INTO symptoms VALUES(?,?)", l.id, s);
      });
    });
  },
  deleteCheckIn(id) {
    return write(async (db) => {
      await db.runAsync("DELETE FROM daily_logs WHERE id=?", id);
    });
  },
  replace(snapshot) {
    return write(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.execAsync(
          "DELETE FROM daily_logs; DELETE FROM periods; DELETE FROM settings; DELETE FROM reminders; DELETE FROM prediction_metadata;",
        );
        await db.runAsync(
          "INSERT INTO settings(id,value) VALUES(1,?)",
          JSON.stringify(snapshot.settings),
        );
        await db.runAsync(
          "INSERT INTO reminders VALUES(?,?,?,?)",
          "daily",
          snapshot.settings.reminderHour,
          snapshot.settings.reminder ? 1 : 0,
          new Date().toISOString(),
        );
        for (const period of snapshot.periods) {
          await db.runAsync(
            "INSERT INTO periods VALUES(?,?,?,?,?)",
            period.id,
            period.start,
            period.end,
            period.createdAt,
            period.updatedAt,
          );
        }
        for (const log of snapshot.logs) {
          await db.runAsync(
            "INSERT INTO daily_logs VALUES(?,?,?,?,?,?,?,?,?,?)",
            log.id,
            log.date,
            log.flow,
            log.pain,
            log.energy,
            log.sleep,
            log.discharge,
            log.notes,
            log.createdAt,
            log.updatedAt,
          );
          for (const mood of log.moods)
            await db.runAsync("INSERT INTO moods VALUES(?,?)", log.id, mood);
          for (const symptom of log.symptoms)
            await db.runAsync("INSERT INTO symptoms VALUES(?,?)", log.id, symptom);
        }
      });
    });
  },
  clear() {
    return write(async (db) => {
      await db.withTransactionAsync(async () => {
        await db.execAsync(
          "DELETE FROM daily_logs; DELETE FROM periods; DELETE FROM settings; DELETE FROM reminders; DELETE FROM prediction_metadata;",
        );
      });
      await db.execAsync("PRAGMA wal_checkpoint(TRUNCATE); VACUUM;");
    });
  },
};
