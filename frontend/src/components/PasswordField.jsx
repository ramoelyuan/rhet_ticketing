import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

/**
 * Password input with show/hide toggle. Use for all password fields app-wide.
 */
export default function PasswordField({
  id,
  label,
  labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
  name,
  disabled,
  className = "",
  inputClassName = "input-field w-full pr-11",
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={inputClassName}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-40 disabled:pointer-events-none"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={disabled ? -1 : 0}
          disabled={disabled}
        >
          {show ? <EyeSlashIcon className="w-5 h-5" aria-hidden /> : <EyeIcon className="w-5 h-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
