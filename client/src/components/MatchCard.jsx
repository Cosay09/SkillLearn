import { Link } from "react-router-dom";
import { describePerson } from "../utils/person";
import Avatar from "./Avatar";
import RequestForm from "./RequestForm";
import SkillTag from "./SkillTag";

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Renders one <li>, so it belongs inside an <ol>
export default function MatchCard({ match, rank, onRequested }) {
  const {
    user,
    score,
    sharedSkills,
    wantedCount,
    avgRating,
    ratingCount,
    overlapHours,
  } = match;
  const available = sharedSkills.filter((skill) => !skill.requested);

  const ratingText =
    ratingCount === 0
      ? "No reviews yet."
      : `Rated ${avgRating} from ${plural(ratingCount, "review")}.`;
  const overlapText =
    overlapHours === 0
      ? "No free time in common yet."
      : `${overlapHours} ${overlapHours === 1 ? "hour" : "hours"} a week free together.`;

  return (
    <li className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <Link
            to={`/users/${user.id}`}
            className="font-semibold underline-offset-4 hover:underline"
          >
            {user.name}
          </Link>
          <p className="text-sm text-muted">
            {describePerson(user) || "University student"}
          </p>
        </div>
        <p
          className={
            rank === 0
              ? "rounded-(--radius-control) bg-accent px-3 py-1 font-display text-2xl font-bold tabular-nums text-on-accent"
              : "py-1 font-display text-2xl font-bold tabular-nums text-muted"
          }
        >
          <span className="sr-only">Match score </span>
          {Math.round(score)}
        </p>
      </div>

      <p className="mt-4 text-sm text-muted">
        Teaches {sharedSkills.length} of the {wantedCount} skills you want to
        learn
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {sharedSkills.map((skill) => (
          <li key={skill.id}>
            <SkillTag name={skill.name} />
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-muted tabular-nums">
        {ratingText} {overlapText}
      </p>

      <div className="mt-5 border-t border-line pt-5">
        {available.length > 0 ? (
          <RequestForm
            receiverId={user.id}
            skills={available}
            onSent={(skillId) => onRequested(user.id, skillId)}
          />
        ) : (
          <p role="status" className="text-sm font-medium text-brand">
            Request sent. Follow it on the{" "}
            <Link to="/requests" className="underline underline-offset-4">
              Requests
            </Link>{" "}
            page.
          </p>
        )}
      </div>
    </li>
  );
}
