import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMatches } from "../api/matches";
import EmptyState from "../components/EmptyState";
import MatchCard from "../components/MatchCard";

function MatchSkeleton() {
  return (
    <div
      role="status"
      className="mt-8 divide-y divide-line rounded-(--radius-panel) border border-line bg-surface"
    >
      <span className="sr-only">Loading matches...</span>
      {[0, 1, 2].map((n) => (
        <div
          key={n}
          className="flex items-center gap-4 p-6 motion-safe:animate-pulse"
        >
          <div className="h-10 w-10 rounded-full bg-line" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-line" />
            <div className="h-3 w-24 rounded bg-line" />
          </div>
          <div className="h-8 w-10 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}

export default function Matches() {
  const [status, setStatus] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState({ hasWantedSkills: true, matches: [] });

  useEffect(() => {
    let active = true;

    getMatches()
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

  // Mark one skill of one tutor as requested without reloading the list
  function markRequested(userId, skillId) {
    setData((current) => ({
      ...current,
      matches: current.matches.map((match) =>
        match.user.id === userId
          ? {
              ...match,
              sharedSkills: match.sharedSkills.map((skill) =>
                skill.id === skillId ? { ...skill, requested: true } : skill,
              ),
            }
          : match,
      ),
    }));
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Find a tutor
      </h1>
      <p className="mt-2 max-w-[60ch] text-muted">
        Students who can teach what you want to learn, ranked by shared skills,
        rating and the hours you are both free.
      </p>
      <p className="mt-1 text-sm text-muted">
        Score: 50% skills, 30% rating, 20% shared free time.
      </p>

      {status === "loading" && <MatchSkeleton />}

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

      {status === "ready" && !data.hasWantedSkills && (
        <div className="mt-8">
          <EmptyState
            title="Add what you want to learn"
            action={
              <Link to="/skills" className="btn btn-primary">
                Add your skills
              </Link>
            }
          >
            Matching starts from your "I want to learn" list. Add a skill and
            the tutors who teach it appear here.
          </EmptyState>
        </div>
      )}

      {status === "ready" &&
        data.hasWantedSkills &&
        data.matches.length === 0 && (
          <div className="mt-8">
            <EmptyState
              title="No tutors match yet"
              action={
                <Link to="/skills" className="btn btn-quiet">
                  Edit your skills
                </Link>
              }
            >
              Nobody has listed the skills you want to learn. Check back as more
              students join, or add more skills to your list.
            </EmptyState>
          </div>
        )}

      {status === "ready" && data.matches.length > 0 && (
        <ol className="mt-8 divide-y divide-line rounded-(--radius-panel) border border-line bg-surface">
          {data.matches.map((match, index) => (
            <MatchCard
              key={match.user.id}
              match={match}
              rank={index}
              onRequested={markRequested}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
