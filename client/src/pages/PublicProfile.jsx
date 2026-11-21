import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUser } from "../api/users";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import RequestForm from "../components/RequestForm";
import SkillTag from "../components/SkillTag";
import { useAuth } from "../context/AuthContext";
import { describePerson } from "../utils/person";

const LEVEL_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function ProfileView({ id }) {
  const { user: me } = useAuth();
  const [status, setStatus] = useState("loading"); // loading, ready, missing or error
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [requested, setRequested] = useState([]);

  useEffect(() => {
    let active = true;

    getUser(id)
      .then(({ user }) => {
        if (!active) return;
        setProfile(user);
        setRequested(user.requestedSkillIds);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 404 || err.status === 400) {
          setStatus("missing");
        } else {
          setError(err.message);
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <p role="status" className="text-muted">
        Loading profile...
      </p>
    );
  }

  if (status === "missing") {
    return (
      <EmptyState
        title="Student not found"
        action={
          <Link to="/matches" className="btn btn-primary">
            Find a tutor
          </Link>
        }
      >
        This profile does not exist, or the student has not finished signing up.
      </EmptyState>
    );
  }

  if (status === "error") {
    return (
      <p role="alert" className="text-danger">
        {error}
      </p>
    );
  }

  const isMe = me.id === profile.id;
  const offered = profile.userSkills.map((entry) => ({
    id: entry.skill.id,
    name: entry.skill.name,
    level: entry.level,
  }));
  const available = offered.filter((skill) => !requested.includes(skill.id));
  const ratingText =
    profile.ratingCount === 0
      ? "No reviews yet"
      : `Rated ${profile.avgRating} from ${profile.ratingCount} ${profile.ratingCount === 1 ? "review" : "reviews"}`;

  return (
    <div className="max-w-3xl">
      <Link
        to="/matches"
        className="text-sm font-medium text-muted hover:text-ink"
      >
        Back to matches
      </Link>

      <div className="mt-4 rounded-(--radius-panel) border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <Avatar name={profile.name} size="lg" />
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-muted">
              {describePerson(profile) || "University student"}
            </p>
            <p className="mt-1 text-sm text-muted tabular-nums">{ratingText}</p>
          </div>
        </div>

        {profile.bio && <p className="mt-6 max-w-[60ch]">{profile.bio}</p>}

        <h2 className="mt-8 text-xl font-semibold tracking-tight">Can teach</h2>
        {offered.length === 0 ? (
          <p className="mt-2 text-muted">
            Has not listed any skills to teach yet.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {offered.map((skill) => (
              <li key={skill.id}>
                <SkillTag name={skill.name} detail={LEVEL_LABEL[skill.level]} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 border-t border-line pt-6">
          {isMe ? (
            <p className="text-sm text-muted">
              This is how other students see you.{" "}
              <Link
                to="/profile"
                className="font-semibold text-ink underline underline-offset-4"
              >
                Edit your profile
              </Link>
            </p>
          ) : available.length > 0 ? (
            <RequestForm
              receiverId={profile.id}
              skills={available}
              onSent={(skillId) =>
                setRequested((current) => [...current, skillId])
              }
            />
          ) : offered.length > 0 ? (
            <p role="status" className="text-sm font-medium text-brand">
              Request sent. Follow it on the{" "}
              <Link to="/requests" className="underline underline-offset-4">
                Requests
              </Link>{" "}
              page.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { id } = useParams();
  return <ProfileView key={id} id={id} />;
}
