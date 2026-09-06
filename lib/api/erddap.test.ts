// Self-check for the ERDDAP CSV parsers. Run: node lib/api/erddap.test.ts
import assert from "node:assert";
import { frontsFromCsv, meanFromCsv, sstDaysFromCsv, stretchFromCsv } from "./erddap.ts";

const header = "time,latitude,longitude,analysed_sst\nUTC,degrees_north,degrees_east,degree_C\n";

// Plain average.
assert.equal(meanFromCsv(header + "t,-38,141,18\nt,-38,142,20\n"), 19);
// NaN (land) cells are ignored.
assert.equal(meanFromCsv(header + "t,-38,141,18\nt,-38,142,NaN\nt,-38,143,22\n"), 20);
// All-NaN region has no mean.
assert.equal(meanFromCsv(header + "t,-38,141,NaN\nt,-38,142,NaN\n"), null);
// No data rows at all.
assert.equal(meanFromCsv(header), null);

// Only cells flagged 1 become points; 0 and NaN (cloud) are dropped.
assert.deepEqual(
  frontsFromCsv(header + "t,-38.1,141,0\nt,-38.1,142,1\nt,-38.2,143,NaN\nt,-38.2,144,1\n"),
  [
    [-38.1, 142],
    [-38.2, 144],
  ],
);
// No data rows → no points.
assert.deepEqual(frontsFromCsv(header), []);

// Stretch = 2nd..98th percentile, NaN ignored: 100 values 0..99 plus NaNs.
const rows = Array.from({ length: 100 }, (_, i) => `t,-38,141,${i}`).join("\n");
assert.deepEqual(stretchFromCsv(header + rows + "\nt,-38,142,NaN\n"), { min: 1, max: 97 });
// All-NaN region has no stretch.
assert.equal(stretchFromCsv(header + "t,-38,141,NaN\n"), null);

// --- sstDaysFromCsv: per-day times + the out-of-family scan filter ---
// The day CSV carries two variables, so rows are time,lat,lon,sst,dtime.
const dayHeader =
  "time,latitude,longitude,sea_surface_temperature,sst_dtime\n" +
  "UTC,degrees_north,degrees_east,degree_C,seconds\n";
const dayRows = (day: string, sst: number, n: number, dt = "NaN") =>
  Array.from({ length: n }, (_, i) => `${day}T12:00:00Z,-38,${141 + i / 100},${sst},${dt}`).join("\n") + "\n";

// Median measurement time per day, Melbourne local. Day 1: offsets 3600/7200/
// 10800 s past 12:00Z -> median 14:00Z = 12:00 am AEST next local day; NaN
// ignored. Day 2 (single cell): 12:00Z - 3600 s = 11:00Z = 9:00 pm AEST.
const dt = dayHeader +
  "2026-07-16T12:00:00Z,-38,141,14,3600\n2026-07-16T12:00:00Z,-38,142,14,10800\n" +
  "2026-07-16T12:00:00Z,-38,143,14,7200\n2026-07-16T12:00:00Z,-38,144,NaN,NaN\n" +
  "2026-07-17T12:00:00Z,-38,141,14,-3600\n";
assert.deepEqual(sstDaysFromCsv(dt).times, { "2026-07-16": "12:00 am", "2026-07-17": "9:00 pm" });

// A day 3 degC off the window median is flagged (this is the Sep 2 2026 case);
// the others pass and the newest of them is the current day.
const win = dayHeader + dayRows("2026-09-01", 14, 60) + dayRows("2026-09-02", 17, 60) + dayRows("2026-09-03", 13.9, 60);
assert.deepEqual(sstDaysFromCsv(win).bad, ["2026-09-02"]);
assert.equal(sstDaysFromCsv(win).latestGood, "2026-09-03");
// Newest day flagged -> latestGood steps back to the last good one.
const hot = dayHeader + dayRows("2026-09-01", 14, 60) + dayRows("2026-09-02", 13.9, 60) + dayRows("2026-09-03", 17, 60);
assert.equal(sstDaysFromCsv(hot).latestGood, "2026-09-02");
// Ordinary day-to-day drift is not flagged.
const calm = dayHeader + dayRows("2026-09-01", 14, 60) + dayRows("2026-09-02", 14.8, 60) + dayRows("2026-09-03", 13.9, 60);
assert.deepEqual(sstDaysFromCsv(calm).bad, []);
// Too few retrievals to judge -> flagged on the cell floor, not the deviation.
const thin = dayHeader + dayRows("2026-09-01", 14, 60) + dayRows("2026-09-02", 14, 10);
assert.deepEqual(sstDaysFromCsv(thin).bad, ["2026-09-02"]);
assert.equal(sstDaysFromCsv(thin).latestGood, "2026-09-01");
// All-NaN and empty inputs: no times, nothing to flag, no current day.
assert.deepEqual(sstDaysFromCsv(dayHeader + "2026-07-16T12:00:00Z,-38,141,NaN,NaN\n"), {
  times: {},
  bad: [],
  latestGood: undefined,
});
assert.deepEqual(sstDaysFromCsv(dayHeader), { times: {}, bad: [], latestGood: undefined });

console.log("erddap.test.ts: all assertions passed");
