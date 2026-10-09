/*
    Jim push korbe
*/

import { useId } from "react";

export default function FormField({ label, hint, ...inputProps }) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? hintId : undefined}
        {...inputProps}
        className="h-11 w-full rounded-(--radius-control) border border-line-strong bg-canvas px-3.5 text-base outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
