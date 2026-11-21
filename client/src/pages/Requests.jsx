import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRequests, updateRequest } from "../api/requests";
import EmptyState from "../components/EmptyState";
import RequestRow from "../components/RequestRow";

export default function Requests() {
  const [tab, setTab] = useState("incoming");
  const [status, setStatus] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [lists, setLists] = useState({ incoming: [], outgoing: [] });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([listRequests("incoming"), listRequests("outgoing")])
      .then(([incoming, outgoing]) => {
        if (!active) return;
        setLists({ incoming: incoming.requests, outgoing: outgoing.requests });
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

  async function handleAction(request, nextStatus) {
    setActionError("");
    setBusyId(request.id);
    try {
      const { request: updated } = await updateRequest(request.id, nextStatus);
      const swap = (list) =>
        list.map((r) => (r.id === updated.id ? updated : r));
      setLists((current) => ({
        incoming: swap(current.incoming),
        outgoing: swap(current.outgoing),
      }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const pendingIncoming = lists.incoming.filter(
    (r) => r.status === "pending",
  ).length;
  const tabs = [
    {
      id: "incoming",
      label: pendingIncoming > 0 ? `Incoming (${pendingIncoming})` : "Incoming",
    },
    { id: "outgoing", label: "Outgoing" },
  ];
  const rows = lists[tab];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Requests
      </h1>
      <p className="mt-2 max-w-[60ch] text-muted">
        Students who asked you to teach, and the tutors you asked.
      </p>

      <div className="mt-8 inline-flex rounded-(--radius-control) border border-line-strong p-1">
        {tabs.map((item) => (
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
          Loading requests...
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
          {tab === "incoming" ? (
            <EmptyState
              title="No requests yet"
              action={
                <Link to="/skills" className="btn btn-quiet">
                  Review the skills you teach
                </Link>
              }
            >
              When a student asks you to teach a skill, it shows up here.
            </EmptyState>
          ) : (
            <EmptyState
              title="You have not asked anyone yet"
              action={
                <Link to="/matches" className="btn btn-primary">
                  Find a tutor
                </Link>
              }
            >
              Find a tutor who teaches what you want to learn and send a
              request.
            </EmptyState>
          )}
        </div>
      )}

      {status === "ready" && rows.length > 0 && (
        <ul className="mt-6 divide-y divide-line rounded-(--radius-panel) border border-line bg-surface">
          {rows.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              direction={tab}
              busy={busyId === request.id}
              onAction={handleAction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
