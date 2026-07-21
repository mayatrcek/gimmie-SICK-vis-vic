export type ContactErrorCode =
  | "name_required"
  | "email_required"
  | "email_invalid"
  | "message_required"
  | "message_too_long";

export type ContactField = "name" | "email" | "message";

export const MESSAGE_MAX = 5000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactInput = { name: string; email: string; message: string };
export type ContactResult = { ok: true } | { ok: false; code: ContactErrorCode; field: ContactField };

export function validateContact(input: ContactInput): ContactResult {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!name) return { ok: false, code: "name_required", field: "name" };
  if (!email) return { ok: false, code: "email_required", field: "email" };
  if (!EMAIL_RE.test(email)) return { ok: false, code: "email_invalid", field: "email" };
  if (!message) return { ok: false, code: "message_required", field: "message" };
  if (message.length > MESSAGE_MAX) return { ok: false, code: "message_too_long", field: "message" };

  return { ok: true };
}
