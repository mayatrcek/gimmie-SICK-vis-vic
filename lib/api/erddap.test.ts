// Self-check for meanFromCsv. Run: node lib/api/erddap.test.ts
import assert from "node:assert";
import { meanFromCsv } from "./erddap.ts";

const header = "time,latitude,longitude,analysed_sst\nUTC,degrees_north,degrees_east,degree_C\n";

// Plain average.
assert.equal(meanFromCsv(header + "t,-38,141,18\nt,-38,142,20\n"), 19);
// NaN (land) cells are ignored.
assert.equal(meanFromCsv(header + "t,-38,141,18\nt,-38,142,NaN\nt,-38,143,22\n"), 20);
// All-NaN region has no mean.
assert.equal(meanFromCsv(header + "t,-38,141,NaN\nt,-38,142,NaN\n"), null);
// No data rows at all.
assert.equal(meanFromCsv(header), null);

console.log("erddap.test.ts: all assertions passed");
