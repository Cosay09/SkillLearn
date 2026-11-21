export default function SkillTag({ name, detail }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-(--radius-control) border border-line-strong px-3 py-1.5 text-sm font-medium">
      {name}
      {detail && <span className="font-normal text-muted">{detail}</span>}
    </span>
  );
}
