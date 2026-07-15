// Self-check for the ERDDAP CSV parsers. Run: node lib/api/erddap.test.ts
import assert from "node:assert";
import { frontsFromCsv, meanFromCsv, stretchFromCsv } from "./erddap.ts";

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

console.log("erddap.test.ts: all assertions passed");
