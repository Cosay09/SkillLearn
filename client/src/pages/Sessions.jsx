import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSessions, updateSession } from "../api/sessions";
import EmptyState from "../components/EmptyState";
import SessionRow from "../components/SessionRow";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function Sessions() {
  const { user } = useAuth();
  const [tab, setTab] = useState("upcoming");
  const [status, setStatus] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [lists, setLists] = useState({ upcoming: [], past: [] });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([listSessions("upcoming"), listSessions("past")])
      .then(([upcoming, past]) => {
        if (!active) return;
        setLists({ upcoming: upcoming.sessions, past: past.sessions });
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }

  async function handleAction(session, nextStatus) {
    if (
      nextStatus === "cancelled" &&
      !window.confirm("Cancel this session? The other student will be told.")
    ) {
      return;
    }

    setActionError("");
    setBusyId(session.id);
    try {
      await updateSession(session.id, nextStatus);
      setAttempt((n) => n + 1); // reload both lists; the session moves to Past
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const rows = lists[tab];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Sessions
      </h1>
      <p className="mt-2 max-w-[60ch] text-muted">
        Your booked tutoring sessions, as tutor or as learner.
      </p>

      <div className="mt-8 inline-flex rounded-(--radius-control) border border-line-strong p-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-[6px] px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              tab === item.id
                ? "bg-brand text-on-brand"
                : "text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p role="alert" className="mt-4 text-sm font-medium text-danger">
          {actionError}
        </p>
      )}

      {status === "loading" && (
        <p role="status" className="mt-6 text-muted">
          Loading sessions...
        </p>
      )}

      {status === "error" && (
        <div className="mt-6 rounded-(--radius-panel) border border-line bg-surface p-6">
          <p role="alert" className="text-danger">
            {error}
          </p>
          <button type="button" onClick={retry} className="btn btn-quiet mt-4">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && rows.length === 0 && (
        <div className="mt-6">
          {tab === "upcoming" ? (
            <EmptyState
              title="No upcoming sessions"
              action={
                <Link to="/requests" className="btn btn-primary">
                  Open requests
                </Link>
              }
            >
              Book a session from a request that has been accepted.
            </EmptyState>
          ) : (
            <EmptyState title="No past sessions yet">
              Completed and cancelled sessions show up here.
            </EmptyState>
          )}
        </div>
      )}

      {status === "ready" && rows.length > 0 && (
        <ul className="mt-6 divide-y divide-line rounded-(--radius-panel) border border-line bg-surface">
          {rows.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              meId={user.id}
              busy={busyId === session.id}
              onAction={handleAction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
