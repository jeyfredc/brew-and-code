"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import type { Dictionary } from "@/dictionaries/get-dictionary";
import { submitBooking } from "@/lib/booking/submit-booking";
import {
  MAX_DAYS_AHEAD, MAX_PARTY_SIZE, validateBooking,
  type Booking, type BookingErrors, type BookingField, type BookingInput,
} from "@/lib/booking/validate-booking";
import { formatIsoDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { addDays, londonToday } from "@/lib/london-time";

type Status = "idle" | "submitting" | "success";

const EMPTY: BookingInput = { name: "", partySize: "2", date: "", time: "" };
const FIELD_ORDER: BookingField[] = ["name", "partySize", "date", "time"];
const inputClasses =
  "h-11 w-full rounded-sm border border-line bg-background px-3 text-base text-foreground aria-invalid:border-2 aria-invalid:border-price";

/** Sustituye {clave} en una sola pasada: el texto insertado nunca se vuelve a interpretar. */
function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => values[key] ?? "");
}

interface Props {
  labels: Dictionary["booking"];
  lang: Locale;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function BookingDialog({ labels, lang, variant = "accent", size = "lg" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successTitleRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const [values, setValues] = useState<BookingInput>(EMPTY);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitError, setSubmitError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [range, setRange] = useState<{ min?: string; max?: string }>({});
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  // Al confirmar se desmonta el botón enfocado: mover el foco al título evita perderlo y lo anuncia.
  useEffect(() => {
    if (status === "success") successTitleRef.current?.focus();
  }, [status]);

  function open() {
    const today = londonToday(new Date());
    setRange({ min: today, max: addDays(today, MAX_DAYS_AHEAD) });
    setValues(EMPTY);
    setErrors({});
    setSubmitError(false);
    setStatus("idle");
    setConfirmed(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function update(field: BookingField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setSubmitError(false);

    const result = validateBooking(values, new Date());
    if (!result.ok) {
      setErrors(result.errors);
      const first = FIELD_ORDER.find((f) => result.errors[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      await submitBooking(result.value);
      setConfirmed(result.value);
      setStatus("success");
    } catch {
      setSubmitError(true);
      setStatus("idle");
    }
  }

  function field(name: BookingField, label: string, control: (props: object) => ReactNode, hint?: string) {
    const id = `${uid}-${name}`;
    const error = errors[name];
    const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
        {control({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, className: inputClasses })}
        {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
        {error && <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-price">{labels.errors[error]}</p>}
      </div>
    );
  }

  const partyOptions = Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1);

  return (
    <>
      <Button variant={variant} size={size} onClick={open}>{labels.open}</Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        className="m-auto w-[min(92vw,30rem)] rounded-md bg-surface p-0 text-foreground shadow-float backdrop:bg-espresso/60"
      >
        <div className="p-6">
          {status === "success" && confirmed ? (
            <div role="status">
              <h2 id={titleId} ref={successTitleRef} tabIndex={-1} className="font-display text-3xl font-bold outline-none">{labels.success.title}</h2>
              <p className="mt-3 text-lg">
                {fillTemplate(labels.success.message, {
                  name: confirmed.name,
                  partySize: String(confirmed.partySize),
                  date: formatIsoDate(confirmed.date, lang),
                  time: confirmed.time,
                })}
              </p>
              <div className="mt-6"><Button variant="primary" onClick={close}>{labels.close}</Button></div>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-4">
              <div>
                <h2 id={titleId} className="font-display text-3xl font-bold">{labels.title}</h2>
                <p className="mt-1 text-muted">{labels.description}</p>
              </div>
              {field("name", labels.fields.name, (p) => (
                <input {...p} type="text" autoComplete="name" maxLength={60} value={values.name}
                  onChange={(e) => update("name", e.target.value)} />
              ))}
              {field("partySize", labels.fields.partySize, (p) => (
                <select {...p} value={values.partySize} onChange={(e) => update("partySize", e.target.value)}>
                  {partyOptions.map((n) => (
                    <option key={n} value={String(n)}>
                      {n === 1 ? labels.personOne : labels.personMany.replace("{n}", String(n))}
                    </option>
                  ))}
                </select>
              ), labels.fields.partySizeHint)}
              {field("date", labels.fields.date, (p) => (
                <input {...p} type="date" min={range.min} max={range.max} value={values.date}
                  onChange={(e) => update("date", e.target.value)} />
              ))}
              {field("time", labels.fields.time, (p) => (
                <input {...p} type="time" step={900} value={values.time}
                  onChange={(e) => update("time", e.target.value)} />
              ))}
              {submitError && <p role="alert" className="text-sm font-semibold text-price">{labels.errors.submitFailed}</p>}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" variant="accent" disabled={status === "submitting"}>
                  {status === "submitting" ? labels.submitting : labels.submit}
                </Button>
                <Button variant="ghost" onClick={close}>{labels.close}</Button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
