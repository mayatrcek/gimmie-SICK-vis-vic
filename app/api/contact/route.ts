import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateContact } from "@/lib/contact/validate";

// Resend sandbox (no verified domain) only delivers to the account's own
// address; switch to a real "from" domain + this to a personal inbox once
// a domain is verified at resend.com/domains.
const TO_EMAIL = "mtrc0001@student.monash.edu";
const FROM_EMAIL = "GIMMIE SICK VIS <onboarding@resend.dev>";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "name_required", field: "name" }, { status: 400 });

  const { name, email, message, company } = body as Record<string, string | undefined>;

  // ponytail: honeypot is the only anti-spam measure here; add rate-limiting if it's ever abused.
  if (company) return NextResponse.json({ ok: true });

  const result = validateContact({ name: name ?? "", email: email ?? "", message: message ?? "" });
  if (!result.ok) return NextResponse.json({ error: result.code, field: result.field }, { status: 400 });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email!.trim(),
      subject: `Contact form: ${name!.trim()}`,
      text: message!.trim(),
    });
    if (error) {
      console.error("resend send error:", error);
      return NextResponse.json({ error: "send_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("resend send threw:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
