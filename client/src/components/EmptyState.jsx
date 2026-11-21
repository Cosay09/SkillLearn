export default function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-(--radius-panel) border border-line bg-surface p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-[52ch] text-muted">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
