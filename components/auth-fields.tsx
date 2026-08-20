"use client";

import { useState } from "react";
import { controlBase } from "./ui";

/** Password input with an inline Show/Hide toggle. */
export function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
  autoComplete = "current-password",
  placeholder,
  required,
  minLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-foreground-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${controlBase} w-full pr-16`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ---- Password requirements -------------------------------------------------

export const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordMeetsAll(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw));
}

/** Live checklist that greens each rule as it's satisfied. */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs transition-colors ${
              ok ? "text-good" : "text-faint"
            }`}
          >
            {ok ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <span className="grid h-3.5 w-3.5 place-items-center" aria-hidden>
                <span className="h-1 w-1 rounded-full bg-current" />
              </span>
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
