import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getConversations, getMessages, sendMessage } from "../api/messages";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const POLL_MS = 5000; // shortcut: polling, not live chat; upgrade to WebSockets later
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function Chat({ conversation }) {
  const { user } = useAuth();
  const id = conversation.requestId;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lastId = useRef(0);
  const box = useRef(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { messages: fresh } = await getMessages(id, lastId.current);
        if (!active || fresh.length === 0) return;
        lastId.current = fresh[fresh.length - 1].id;
        // A message I just sent may already be on screen, so skip ids we know
        setMessages((current) => {
          const known = new Set(current.map((m) => m.id));
          return [...current, ...fresh.filter((m) => !known.has(m.id))];
        });
      } catch {
        // the next poll tries again
      }
    }

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [messages.length]);

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;

    setBusy(true);
    setError("");
    try {
      const { message } = await sendMessage({ matchRequestId: id, body });
      setMessages((current) =>
        current.some((m) => m.id === message.id)
          ? current
          : [...current, message],
      );
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-line p-4">
        <Link
          to="/messages"
          className="text-sm font-medium text-muted hover:text-ink lg:hidden"
        >
          All messages
        </Link>
        <Avatar name={conversation.other.name} size="sm" />
        <div className="min-w-0">
          <Link
            to={`/users/${conversation.other.id}`}
            className="font-semibold underline-offset-4 hover:underline"
          >
            {conversation.other.name}
          </Link>
          <p className="text-sm text-muted">{conversation.skill.name}</p>
        </div>
      </div>

      <div ref={box} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <p
                className={`max-w-[75%] whitespace-pre-wrap break-words rounded-(--radius-control) px-3.5 py-2 ${
                  mine ? "bg-brand text-on-brand" : "bg-canvas"
                }`}
              >
                {m.body}
              </p>
              <span className="mt-1 text-xs text-muted tabular-nums">
                {timeFormat.format(new Date(m.createdAt))}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="border-t border-line p-4">
        <div className="flex gap-3">
          <input
            aria-label="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Write a message"
            className="field h-11 min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default function Messages() {
  const { requestId } = useParams();
  const [status, setStatus] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    let active = true;

    const load = () =>
      getConversations()
        .then((data) => {
          if (!active) return;
          setConversations(data.conversations);
          setStatus("ready");
        })
        .catch((err) => {
          if (!active) return;
          setError(err.message);
          setStatus((s) => (s === "loading" ? "error" : s)); // later poll errors are ignored
        });

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [attempt]);

  function retry() {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }

  const current = conversations.find((c) => String(c.requestId) === requestId);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Messages
      </h1>
      <p className="mt-2 max-w-[60ch] text-muted">
        Chat with students whose request was accepted.
      </p>

      {status === "loading" && (
        <p role="status" className="mt-8 text-muted">
          Loading conversations...
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

      {status === "ready" && conversations.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No conversations yet"
            action={
              <Link to="/requests" className="btn btn-primary">
                Open requests
              </Link>
            }
          >
            Chat opens as soon as a tutor accepts a request.
          </EmptyState>
        </div>
      )}

      {status === "ready" && conversations.length > 0 && (
        <div className="mt-8 grid h-[34rem] grid-rows-1 overflow-hidden rounded-(--radius-panel) border border-line bg-surface lg:grid-cols-[20rem_1fr]">
          <ul
            className={`divide-y divide-line overflow-y-auto lg:border-r lg:border-line ${
              requestId ? "hidden lg:block" : ""
            }`}
          >
            {conversations.map((c) => (
              <li key={c.requestId}>
                <Link
                  to={`/messages/${c.requestId}`}
                  className={`flex items-center gap-3 p-4 transition-colors duration-150 hover:bg-canvas ${
                    String(c.requestId) === requestId ? "bg-canvas" : ""
                  }`}
                >
                  <Avatar name={c.other.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.other.name}</p>
                    <p className="truncate text-sm text-muted">
                      {c.skill.name}
                      {c.lastMessage ? `: ${c.lastMessage.body}` : ""}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-on-brand">
                      <span className="sr-only">Unread: </span>
                      {c.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className={`min-h-0 ${requestId ? "" : "hidden lg:block"}`}>
            {current ? (
              <Chat key={current.requestId} conversation={current} />
            ) : (
              <p className="p-6 text-muted">
                {requestId
                  ? "This conversation is not available."
                  : "Select a conversation."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
