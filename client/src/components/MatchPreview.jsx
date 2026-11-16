/*
    Mahadi push korbe
*/

const wanted = ["Python", "SQL", "Figma"];

const matches = [
  { name: "Nadia R.", offers: "Python, SQL", score: 72 },
  { name: "Imran H.", offers: "Python, SQL, Figma", score: 69 },
  { name: "Sadia A.", offers: "Python", score: 67 },
];

function initials(name) {
  return name
    .replace(".", "")
    .split(" ")
    .map((word) => word[0])
    .join("");
}

export default function MatchPreview() {
  return (
    <figure
      className="rise-in rounded-(--radius-panel) border border-line bg-surface p-5 shadow-[0_24px_48px_-24px_rgba(11,93,70,0.35)] sm:p-6"
      style={{ "--i": 3 }}
    >
      <figcaption className="text-sm text-muted">
        Rafi wants to learn
      </figcaption>

      <ul className="mt-3 flex flex-wrap gap-2">
        {wanted.map((skill) => (
          <li
            key={skill}
            className="rounded-(--radius-control) border border-line-strong px-3 py-1.5 text-sm font-medium"
          >
            {skill}
          </li>
        ))}
      </ul>

      <ol className="mt-6 divide-y divide-line">
        {matches.map((match, i) => (
          <li
            key={match.name}
            className="rise-in flex items-center gap-4 py-4 first:pt-0 last:pb-0"
            style={{ "--i": 4 + i }}
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-canvas text-sm font-semibold"
            >
              {initials(match.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{match.name}</p>
              <p className="truncate text-sm text-muted">
                Teaches {match.offers}
              </p>
            </div>
            <span
              className={
                i === 0
                  ? "rounded-(--radius-control) bg-accent px-3 py-1 font-display text-2xl font-bold tabular-nums text-on-accent"
                  : "font-display text-2xl font-bold tabular-nums text-muted"
              }
            >
              <span className="sr-only">Match score </span>
              {match.score}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-muted">
        Sample data. Score is 50% skills, 30% rating, 20% shared free time.
      </p>
    </figure>
  );
}
