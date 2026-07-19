// Self-check for the GIBS Domains parser. Run: node components/geo/gibs.test.ts
import assert from "node:assert";
import { fallbackDays, parseDomain } from "./gibs.ts";

// Real SNPP response shape: two periods with a gap (Jul 11–15 missing).
const snpp =
  "<Domains xmlns:ows='http://www.opengis.net/ows/1.1'><DimensionDomain><ows:Identifier>time</ows:Identifier>" +
  "<Domain>2026-07-08/2026-07-10/P1D,2026-07-16/2026-07-18/P1D</Domain><Size>1</Size></DimensionDomain></Domains>";
assert.deepEqual(parseDomain(snpp), [
  "2026-07-18",
  "2026-07-17",
  "2026-07-16",
  "2026-07-10",
  "2026-07-09",
  "2026-07-08",
]);

// Single period.
assert.deepEqual(parseDomain("<Domain>2026-07-17/2026-07-18/P1D</Domain>"), [
  "2026-07-18",
  "2026-07-17",
]);
// Bare single date, no period.
assert.deepEqual(parseDomain("<Domain>2026-07-18</Domain>"), ["2026-07-18"]);
// Empty domain, garbage, and error XML all parse to nothing.
assert.deepEqual(parseDomain("<Domain></Domain>"), []);
assert.deepEqual(parseDomain("not xml"), []);
assert.deepEqual(parseDomain("<ExceptionReport>Invalid Layer</ExceptionReport>"), []);

// Fallback: n consecutive days, newest first, starting lag days back.
const fb = fallbackDays(2, 12);
assert.equal(fb.length, 12);
assert.equal(fb[0], new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10));
assert.ok(fb[0] > fb[11]);

console.log("gibs.test.ts ok");
