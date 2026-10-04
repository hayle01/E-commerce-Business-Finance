"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

export function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        className="input w-full pl-9 pr-10"
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder ?? "Password"}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
