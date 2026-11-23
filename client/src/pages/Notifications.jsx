import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markAllRead } from "../api/notifications";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/person";

// Where each notification type leads
const TARGET = { request: "/requests", decision: "/requests" };

export default function Notifications() {
  const [status, setStatus] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    getNotifications()
      .then((result) => {
        if (!active) return;
        setData(result);
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

  async function handleMarkAll() {
    setBusy(true);
    try {
      await markAllRead();
      setData((d) => ({
        unreadCount: 0,
        notifications: d.notifications.map((n) => ({ ...n, isRead: true })),
      }));
      window.dispatchEvent(new Event("notifications-changed")); // lets the bell update
    } catch (err) {
      setError(err.message);
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Notifications
          </h1>
          <p className="mt-2 max-w-[60ch] text-muted">
            New requests and answers to your requests.
          </p>
        </div>
        {status === "ready" && data.unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={busy}
            className="btn btn-quiet"
          >
            Mark all as read
          </button>
        )}
      </div>

      {status === "loading" && (
        <p role="status" className="mt-8 text-muted">
          Loading notifications...
        </p>
      )}

      {status === "error" && (
        <div className="mt-8 rounded-(--radius-panel) border border-line bg-surface p-6">
          <p role="alert" className="text-danger">
            {error}
          </p>
          <button type="button" onClick={retry} className="btn btn-quiet mt-4">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && data.notifications.length === 0 && (
        <div className="mt-8">
          <EmptyState title="No notifications yet">
            When a student asks you to teach a skill, or answers your request,
            it shows up here.
          </EmptyState>
        </div>
      )}

      {status === "ready" && data.notifications.length > 0 && (
        <ul className="mt-8 divide-y divide-line overflow-hidden rounded-(--radius-panel) border border-line bg-surface">
          {data.notifications.map((n) => (
            <li key={n.id}>
              <Link
                to={TARGET[n.type] ?? "/dashboard"}
                className="flex items-start gap-4 p-5 transition-colors duration-150 hover:bg-canvas sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-brand"}`}
                />
                <div className="min-w-0">
                  <p className={n.isRead ? "text-muted" : "font-semibold"}>
                    {!n.isRead && <span className="sr-only">Unread. </span>}
                    {n.content}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
