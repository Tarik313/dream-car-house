"use client";

import { useState } from "react";

const TOPICS = [
  { value: "BUYING", label: "Buying a car" },
  { value: "SELLING", label: "Selling my car" },
  { value: "AFTER_SALES", label: "After-sales & service" },
  { value: "OTHER", label: "Something else" },
] as const;

const PREFS = [
  { value: "WHATSAPP", label: "WhatsApp", short: "WhatsApp" },
  { value: "PHONE", label: "Phone call", short: "phone" },
  { value: "EMAIL", label: "Email", short: "email" },
] as const;

type Topic = (typeof TOPICS)[number]["value"];
type Pref = (typeof PREFS)[number]["value"];
type Fields = { name: string; phone: string; email: string; vehicle: string; message: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", phone: "", email: "", vehicle: "", message: "" };
const PHONE_RE = /^[+0-9\s-]{8,20}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const inputClass =
  "w-full bg-page border border-line rounded-lg px-4 py-3.5 text-ink text-[15px] outline-none transition-colors focus:border-gray-400 placeholder:text-muted";

function validate(f: Fields, pref: Pref): FieldErrors {
  const e: FieldErrors = {};
  if (!f.name.trim()) e.name = "Please enter your name.";
  if (!PHONE_RE.test(f.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (pref === "EMAIL" && !f.email.trim()) e.email = "Add an email so we can reply.";
  else if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = "That email doesn't look right.";
  if (!f.message.trim()) e.message = "Tell us a little about your enquiry.";
  return e;
}

export default function ContactForm() {
  const [topic, setTopic] = useState<Topic>("BUYING");
  const [pref, setPref] = useState<Pref>("WHATSAPP");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState<{ firstName: string; topic: string; pref: string } | null>(null);

  const selling = topic === "SELLING";

  const setField = (key: keyof Fields) => (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = ev.target.value;
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setSubmitError("");

    const clientErrors = validate(fields, pref);
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/home/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          preferred_contact: pref,
          name: fields.name.trim(),
          phone: fields.phone.trim(),
          email: fields.email.trim(),
          vehicle: fields.vehicle.trim(),
          enquiry: fields.message.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const details: Record<string, string[] | string> | undefined = json?.details;
        const serverErrors: FieldErrors = {};
        if (details) {
          for (const key of Object.keys(EMPTY) as (keyof Fields)[]) {
            // The API names the message field `enquiry` (see ContactMessageSerializer).
            const msg = details[key === "message" ? "enquiry" : key];
            if (msg) serverErrors[key] = Array.isArray(msg) ? msg[0] : msg;
          }
        }
        if (Object.keys(serverErrors).length) setErrors(serverErrors);
        else setSubmitError("We couldn't send your message. Please try again, or call or WhatsApp us.");
        return;
      }

      setSent({
        firstName: fields.name.trim().split(/\s+/)[0] || "there",
        topic: TOPICS.find((t) => t.value === topic)!.label.toLowerCase(),
        pref: PREFS.find((p) => p.value === pref)!.short,
      });
    } catch {
      setSubmitError("We couldn't send your message. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSent(null);
    setFields(EMPTY);
    setErrors({});
    setSubmitError("");
  };

  if (sent) {
    return (
      <div className="bg-page border border-line rounded-lg p-10 flex flex-col items-start gap-4" role="status">
        <div className="w-12 h-12 rounded-full bg-accent text-ink flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold">Thank you, {sent.firstName}.</h3>
        <p className="text-muted text-sm leading-relaxed max-w-md">
          Your message about <span className="text-ink">{sent.topic}</span> has been sent.
          Our team will reach you by <span className="text-ink">{sent.pref}</span> shortly.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 px-6 py-3 bg-accent hover:bg-accent-hover text-ink rounded text-sm transition-colors cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <fieldset>
        <legend className="block text-sm text-muted mb-2">I&apos;m interested in</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Chip key={t.value} active={topic === t.value} onClick={() => setTopic(t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Full name" error={errors.name}>
          <input type="text" autoComplete="name" value={fields.name} onChange={setField("name")} placeholder="Your name" className={inputClass} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input type="tel" autoComplete="tel" value={fields.phone} onChange={setField("phone")} placeholder="+880" className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Email" optional={pref !== "EMAIL"} error={errors.email}>
          <input type="email" autoComplete="email" value={fields.email} onChange={setField("email")} placeholder="you@example.com" className={inputClass} />
        </Field>
        <Field label={selling ? "Your car" : "Vehicle of interest"} optional>
          <input
            type="text"
            value={fields.vehicle}
            onChange={setField("vehicle")}
            placeholder={selling ? "Make, model and year" : "e.g. Porsche Cayenne"}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Message" error={errors.message}>
        <textarea
          rows={5}
          value={fields.message}
          onChange={setField("message")}
          placeholder="How can we help?"
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </Field>

      <fieldset>
        <legend className="block text-sm text-muted mb-2">Preferred way to reach you</legend>
        <div className="flex flex-wrap gap-2">
          {PREFS.map((p) => (
            <Chip
              key={p.value}
              active={pref === p.value}
              onClick={() => {
                setPref(p.value);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      {submitError && (
        <p className="text-sm text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex items-center gap-6 flex-wrap mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-white text-ink px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Sending…" : "Send Message"}
        </button>
        <span className="text-[13px] text-muted">We never share your details.</span>
      </div>
    </form>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 rounded text-sm cursor-pointer transition-colors duration-300 ${
        active ? "bg-accent text-white" : "bg-soft text-ink hover:bg-panel"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-muted mb-2">
        {label} {optional && <span className="text-muted">(optional)</span>}
      </span>
      {children}
      {error && <p className="text-[13px] text-red-600 mt-1.5">{error}</p>}
    </label>
  );
}
