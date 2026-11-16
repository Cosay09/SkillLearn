export default function SwapMark({ size = 20, onBand = false }) {
  const overlap = Math.round(size * 0.4);

  return (
    <span
      aria-hidden="true"
      className="relative inline-block shrink-0"
      style={{ width: size + overlap, height: size }}
    >
      <span
        className="absolute left-0 top-0 rounded-full"
        style={{ width: size, height: size, backgroundColor: "var(--accent)" }}
      />
      <span
        className="absolute top-0 rounded-full border-2"
        style={{
          left: overlap,
          width: size,
          height: size,
          borderColor: onBand ? "var(--on-band)" : "var(--brand)",
        }}
      />
    </span>
  );
}
