/*
    Jim push korbe
*/

import { useId } from "react";

export default function FormField({
  label,
  hint,
  as: Control = "input",
  children,
  ...controlProps
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const size = Control === "textarea" ? "min-h-28 py-2.5" : "h-11";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Control
        id={id}
        aria-describedby={hint ? hintId : undefined}
        {...controlProps}
        className={`field w-full ${size}`}
      >
        {children}
      </Control>
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
