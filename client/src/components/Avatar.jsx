const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

// Pass `label` when the avatar is the only place the name appears
export default function Avatar({ name, size = "md", label, className = "" }) {
  return (
    <span
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      className={`flex shrink-0 items-center justify-center rounded-full border border-line bg-canvas font-semibold ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
