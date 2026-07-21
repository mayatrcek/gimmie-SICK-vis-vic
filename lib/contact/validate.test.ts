// Self-check for contact form validation. Run: node lib/contact/validate.test.ts
import assert from "node:assert";
import { MESSAGE_MAX, validateContact } from "./validate.ts";

assert.equal(validateContact({ name: "", email: "a@b.com", message: "hi" }).ok, false);
assert.equal(validateContact({ name: "  ", email: "a@b.com", message: "hi" }).ok, false);
assert.deepEqual(validateContact({ name: "", email: "a@b.com", message: "hi" }), {
  ok: false,
  code: "name_required",
  field: "name",
});

assert.deepEqual(validateContact({ name: "Maya", email: "", message: "hi" }), {
  ok: false,
  code: "email_required",
  field: "email",
});
assert.deepEqual(validateContact({ name: "Maya", email: "not-an-email", message: "hi" }), {
  ok: false,
  code: "email_invalid",
  field: "email",
});

assert.deepEqual(validateContact({ name: "Maya", email: "a@b.com", message: "" }), {
  ok: false,
  code: "message_required",
  field: "message",
});
assert.deepEqual(
  validateContact({ name: "Maya", email: "a@b.com", message: "x".repeat(MESSAGE_MAX + 1) }),
  { ok: false, code: "message_too_long", field: "message" },
);

assert.deepEqual(validateContact({ name: "Maya", email: "a@b.com", message: "Nice site!" }), {
  ok: true,
});

console.log("contact validate.test.ts: ok");
