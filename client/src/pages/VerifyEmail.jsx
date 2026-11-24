import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { resendVerification, verifyEmail } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function Notice({ notice }) {
  if (!notice.text) return null;
  return (
    <p
      role={notice.type === "error" ? "alert" : "status"}
      className={`mt-4 text-sm font-medium ${notice.type === "error" ? "text-danger" : "text-brand"}`}
    >
      {notice.text}
    </p>
  );
}

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const { user, loading, refreshUser, logout } = useAuth();

  const [result, setResult] = useState(token ? "verifying" : ""); // verifying, verified or failed
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Wait for the saved login to load, and run only once even in development
    if (!token || loading || started.current) return;
    started.current = true;

    verifyEmail(token)
      .then(() => refreshUser())
      .then(() => setResult("verified"))
      .catch((err) => {
        setError(err.message);
        setResult("failed");
      });
  }, [token, loading, refreshUser]);

  async function handleResend() {
    setSending(true);
    setNotice({ type: "", text: "" });
    try {
      await resendVerification();
      setNotice({
        type: "success",
        text: "Email sent. It can take a minute to arrive.",
      });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="py-12 text-center text-muted">
        Loading...
      </p>
    );
  }

  if (!token) {
    if (!user) return <Navigate to="/login" replace />;
    if (user.emailVerifiedAt) return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell
      panelTitle="One more step."
      panelText="Only university students can join SkillLearn, so we check your email first."
    >
      {token && result === "verifying" && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Verifying your email
          </h1>
          <p role="status" className="mt-2 text-muted">
            This takes a moment.
          </p>
        </>
      )}

      {token && result === "verified" && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">Email verified</h1>
          <p className="mt-2 text-muted">Your account is ready to use.</p>
          <Link
            to={user ? "/dashboard" : "/login"}
            className="btn btn-primary mt-8"
          >
            Continue
          </Link>
        </>
      )}

      {token && result === "failed" && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            This link did not work
          </h1>
          <p role="alert" className="mt-2 text-muted">
            {error}
          </p>
          {user?.emailVerifiedAt ? (
            <Link to="/dashboard" className="btn btn-primary mt-8">
              Go to dashboard
            </Link>
          ) : user ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="btn btn-primary mt-8"
            >
              {sending ? "Sending..." : "Send a new link"}
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary mt-8">
              Log in to get a new link
            </Link>
          )}
          <Notice notice={notice} />
        </>
      )}

      {!token && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="mt-2 text-muted">
            We sent a link to{" "}
            <strong className="font-semibold text-ink">{user.email}</strong>.
            Click on the link to finish creating your account.
          </p>
          <p className="mt-2 text-sm text-muted">
            Cannot find it? Check your spam folder.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={sending}
              className="btn btn-primary"
            >
              {sending ? "Sending..." : "Send the email again"}
            </button>
            <button type="button" onClick={logout} className="btn btn-quiet">
              Log out
            </button>
          </div>
          <Notice notice={notice} />
        </>
      )}
    </AuthShell>
  );
}
