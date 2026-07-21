"use client";

import { useState } from "react";
import { validateContact, type ContactErrorCode, type ContactField } from "@/lib/contact/validate";

const ERROR_MESSAGES: Record<ContactErrorCode, string> = {
  name_required: "Enter your name.",
  email_required: "Enter your email.",
  email_invalid: "Enter a valid email address.",
  message_required: "Enter a message.",
  message_too_long: "Message is too long — keep it under 5000 characters.",
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errField, setErrField] = useState<ContactField | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = validateContact({ name, email, message });
    if (!result.ok) {
      setErrField(result.field);
      setErrMsg(ERROR_MESSAGES[result.code]);
      return;
    }

    setErrField(null);
    setErrMsg(null);
    setStatus("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => null);
        const code: ContactErrorCode | "send_failed" = body?.error ?? "send_failed";
        if (code in ERROR_MESSAGES) {
          setErrField(body.field);
          setErrMsg(ERROR_MESSAGES[code as ContactErrorCode]);
        } else {
          setErrMsg("Couldn't send that — try again in a bit.");
        }
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrMsg("Couldn't send that — try again in a bit.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p>Message sent — thanks, I&rsquo;ll get back to you.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <input
        className="hp"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        aria-hidden="true"
      />

      <div className={`field${errField === "name" ? " field-error" : ""}`}>
        <label className="field-label" htmlFor="name">
          Name
        </label>
        <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className={`field${errField === "email" ? " field-error" : ""}`}>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={`field${errField === "message" ? " field-error" : ""}`}>
        <label className="field-label" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          className="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {errMsg && (
        <p className="field-msg" style={{ marginBottom: 14 }}>
          {errMsg}
        </p>
      )}

      <button type="submit" className="primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
