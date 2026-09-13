const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
const { calculateCycle, validatePeriod } = require("../src/services/cycle.ts");
const { validDate, addDays, daysBetween } = require("../src/utils/dates.ts");
const { defaults } = require("../src/types/index.ts");
const p = (start, end = null, id = start) => ({
  id,
  start,
  end,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
});
test("calendar dates reject impossible days and preserve leap days across timezone changes", () => {
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-13-01"), false);
  assert.equal(addDays("2024-02-28", 2), "2024-03-01");
  assert.equal(daysBetween("2026-03-07", "2026-03-10"), 3);
});
test("history replaces setup average and never wraps a late cycle", () => {
  const r = calculateCycle(
    [
      p("2026-01-01", "2026-01-05"),
      p("2026-01-31", "2026-02-04"),
      p("2026-03-04", "2026-03-08"),
    ],
    defaults,
    "2026-04-10",
  );
  assert.equal(r.average, 31);
  assert.equal(r.next, "2026-04-04");
  assert.equal(r.day, 38);
  assert.equal(r.overdue, true);
  assert.equal(r.phase, "unknown");
  assert.equal(r.sampleSize, 2);
});
test("only six recent intervals contribute, including long recorded cycles", () => {
  let date = "2025-01-01";
  const periods = [p(date, date)];
  for (const interval of [28, 70, 30, 31, 32, 33, 34]) {
    date = addDays(date, interval);
    periods.push(p(date, date));
  }
  const r = calculateCycle(periods, defaults, date);
  assert.equal(r.average, 38);
  assert.equal(r.sampleSize, 6);
  assert.equal(r.variability, 40);
});
test("empty history and open periods remain explicit", () => {
  assert.equal(calculateCycle([], defaults, "2026-01-01").next, null);
  assert.equal(
    calculateCycle([p("2026-01-01")], defaults, "2026-01-15").phase,
    "menstrual",
  );
  assert.equal(
    calculateCycle([], { ...defaults, cycleLength: 35 }, "2026-01-01").average,
    35,
  );
});
test("periods reject overlap, open overlap, future dates, and reversed ranges", () => {
  const periods = [p("2026-01-01", "2026-01-05")];
  assert.equal(
    validatePeriod(p("2026-01-05", "2026-01-07"), periods, "2026-02-01"),
    false,
  );
  assert.equal(
    validatePeriod(p("2026-01-06", "2026-01-07"), periods, "2026-02-01"),
    true,
  );
  assert.equal(
    validatePeriod(p("2026-01-04", "2026-01-03"), periods, "2026-02-01"),
    false,
  );
  assert.equal(validatePeriod(p("2026-03-01"), periods, "2026-02-01"), false);
  assert.equal(
    validatePeriod(p("2026-01-20"), [p("2026-01-01")], "2026-02-01"),
    false,
  );
});
test("all English locale keys have Kiswahili translations and matching placeholders", () => {
  const en = require("../src/locales/en/index.ts").default,
    sw = require("../src/locales/sw/index.ts").default;
  assert.deepEqual(Object.keys(en).sort(), Object.keys(sw).sort());
  for (const key of Object.keys(en)) {
    assert.ok(sw[key]);
    assert.deepEqual(en[key].match(/\{\w+\}/g), sw[key].match(/\{\w+\}/g));
  }
});
test("SQLite repository persists, updates, rolls back duplicate dates, cascades deletes, and erases", async () => {
  const { DatabaseSync } = require("node:sqlite");
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "hedhi-tests-"));
  const filename = path.join(temp, "test.db");
  const db = new DatabaseSync(filename);
  const Module = require("node:module");
  const original = Module._load;
  Module._load = function (name, ...args) {
    if (name === "expo-sqlite")
      return {
        openDatabaseAsync: async () => ({
          execAsync: async (sql) => db.exec(sql),
          getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...args),
          getAllAsync: async (sql, ...args) => db.prepare(sql).all(...args),
          runAsync: async (sql, ...args) => db.prepare(sql).run(...args),
          withTransactionAsync: async (fn) => {
            db.exec("BEGIN");
            try {
              await fn();
              db.exec("COMMIT");
            } catch (e) {
              db.exec("ROLLBACK");
              throw e;
            }
          },
        }),
      };
    return original.call(this, name, ...args);
  };
  try {
    const { repository } = require("../src/repositories/health.ts");
    assert.equal((await repository.load()).settings.onboarded, false);
    await repository.saveSettings({
      ...defaults,
      onboarded: true,
      name: "Test",
    });
    await repository.savePeriod(p("2026-01-01", "2026-01-05"));
    const log = {
      id: "one",
      date: "2026-01-02",
      flow: "light",
      pain: 2,
      energy: 3,
      sleep: 7,
      discharge: "none",
      notes: "private",
      moods: ["calm"],
      symptoms: ["cramps"],
      createdAt: "now",
      updatedAt: "now",
    };
    await repository.saveCheckIn(log);
    await repository.saveCheckIn({
      ...log,
      notes: "edited",
      moods: ["happy"],
      symptoms: [],
    });
    let snapshot = await repository.load();
    assert.equal(snapshot.logs[0].notes, "edited");
    assert.deepEqual(snapshot.logs[0].moods, ["happy"]);
    assert.deepEqual(snapshot.logs[0].symptoms, []);
    await assert.rejects(repository.saveCheckIn({ ...log, id: "duplicate" }));
    assert.equal((await repository.load()).logs.length, 1);
    const second = new DatabaseSync(filename);
    assert.equal(
      second.prepare("SELECT notes FROM daily_logs").get().notes,
      "edited",
    );
    second.close();
    await repository.deleteCheckIn("one");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM moods").get().n, 0);
    const restoredLog = {
      ...log,
      id: "restored",
      date: "2026-02-02",
      notes: "restored safely",
    };
    await repository.replace({
      settings: { ...defaults, onboarded: true, name: "Restored" },
      periods: [p("2026-02-01", "2026-02-05", "restored-period")],
      logs: [restoredLog],
    });
    snapshot = await repository.load();
    assert.equal(snapshot.settings.name, "Restored");
    assert.equal(snapshot.periods[0].id, "restored-period");
    assert.equal(snapshot.logs[0].notes, "restored safely");
    await assert.rejects(
      repository.replace({
        ...snapshot,
        logs: [restoredLog, { ...restoredLog, id: "duplicate-date" }],
      }),
    );
    snapshot = await repository.load();
    assert.equal(snapshot.settings.name, "Restored");
    assert.equal(snapshot.logs.length, 1);
    await repository.clear();
    snapshot = await repository.load();
    assert.equal(snapshot.logs.length, 0);
    assert.equal(snapshot.periods.length, 0);
    assert.equal(snapshot.settings.onboarded, false);
  } finally {
    Module._load = original;
    db.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
