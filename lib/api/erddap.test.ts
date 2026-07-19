// Self-check for the ERDDAP CSV parsers. Run: node lib/api/erddap.test.ts
import assert from "node:assert";
import { frontsFromCsv, meanFromCsv, medianTimesFromCsv, stretchFromCsv } from "./erddap.ts";

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

// Median measurement time per day, Melbourne local. Day 1: offsets 3600/7200/
// 10800 s past 12:00Z → median 14:00Z = 12:00 am AEST next local day; NaN
// ignored. Day 2 (single cell): 12:00Z − 3600 s = 11:00Z = 9:00 pm AEST.
const dt = header +
  "2026-07-16T12:00:00Z,-38,141,3600\n2026-07-16T12:00:00Z,-38,142,10800\n" +
  "2026-07-16T12:00:00Z,-38,143,7200\n2026-07-16T12:00:00Z,-38,144,NaN\n" +
  "2026-07-17T12:00:00Z,-38,141,-3600\n";
assert.deepEqual(medianTimesFromCsv(dt), { "2026-07-16": "12:00 am", "2026-07-17": "9:00 pm" });
// All-NaN and empty inputs yield no entries.
assert.deepEqual(medianTimesFromCsv(header + "2026-07-16T12:00:00Z,-38,141,NaN\n"), {});
assert.deepEqual(medianTimesFromCsv(header), {});

console.log("erddap.test.ts: all assertions passed");
