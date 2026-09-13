export const migrations = [
  `CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL);
CREATE TABLE periods (id TEXT PRIMARY KEY, start TEXT NOT NULL UNIQUE, end TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, CHECK(end IS NULL OR end >= start));
CREATE TABLE daily_logs (id TEXT PRIMARY KEY, date TEXT NOT NULL UNIQUE, flow TEXT NOT NULL, pain INTEGER NOT NULL CHECK(pain BETWEEN 0 AND 10), energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 5), sleep REAL, discharge TEXT NOT NULL, notes TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
CREATE TABLE moods (logId TEXT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE, value TEXT NOT NULL, PRIMARY KEY(logId,value));
CREATE TABLE symptoms (logId TEXT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE, value TEXT NOT NULL, PRIMARY KEY(logId,value));
CREATE TABLE reminders (id TEXT PRIMARY KEY, hour INTEGER NOT NULL, enabled INTEGER NOT NULL, updatedAt TEXT NOT NULL);
CREATE TABLE prediction_metadata (id TEXT PRIMARY KEY, algorithmVersion INTEGER NOT NULL, generatedAt TEXT NOT NULL, value TEXT NOT NULL);
CREATE VIEW cycles AS SELECT id, start, LEAD(start) OVER (ORDER BY start) AS nextStart FROM periods;
CREATE INDEX logs_by_date ON daily_logs(date);`,
];
