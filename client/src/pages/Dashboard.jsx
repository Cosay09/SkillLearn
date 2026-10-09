/*
    Jim push korbe
*/

import { useAuth } from "../context/AuthContext";

const cards = [
  "Upcoming sessions",
  "Pending requests",
  "Unread messages",
  "Suggested tutors",
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
      <p className="mt-1 text-slate-600">
        Your sessions, requests and matches will appear here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((title) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">Nothing here yet.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
