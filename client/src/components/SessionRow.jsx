import { Link } from "react-router-dom";
import { formatSession } from "../utils/person";
import Avatar from "./Avatar";

const STATUS_LABEL = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE = {
  scheduled: "border border-line-strong text-muted",
  completed: "bg-brand/15 text-brand",
  cancelled: "bg-canvas text-muted",
};

// Renders one <li>, so it belongs inside a <ul>
export default function SessionRow({ session, meId, busy, onAction }) {
  const teaching = session.tutorId === meId;
  const other = teaching ? session.learner : session.tutor;
  const scheduled = session.status === "scheduled";
  const ended = new Date(session.endTime) <= new Date();

  const name = (
    <Link
      to={`/users/${other.id}`}
      className="font-semibold underline-offset-4 hover:underline"
    >
      {other.name}
    </Link>
  );
  const skill = <span className="font-semibold">{session.skill.name}</span>;

  return (
    <li className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Avatar name={other.name} />
        <div className="min-w-0">
          <p>
            {teaching ? (
              <>
                You teach {skill} to {name}
              </>
            ) : (
              <>
                {name} teaches you {skill}
              </>
            )}
          </p>
          <p className="text-sm text-muted tabular-nums">
            {formatSession(session.startTime, session.endTime)}
          </p>
          {session.meetingInfo && (
            <p className="text-sm text-muted">{session.meetingInfo}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-(--radius-control) px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[session.status]}`}
        >
          {STATUS_LABEL[session.status]}
        </span>

        {scheduled && ended && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(session, "completed")}
            className="btn btn-primary btn-sm"
          >
            Mark completed
          </button>
        )}

        {scheduled && !ended && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onAction(session, "cancelled")}
            className="btn btn-quiet btn-sm"
          >
            Cancel session
          </button>
        )}
      </div>
    </li>
  );
}
