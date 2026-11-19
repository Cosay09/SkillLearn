import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      panelTitle="We will get you back in."
      panelText="Enter your university email and we will send you a link to choose a new password."
    >
      {sentTo ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Check your email
          </h1>
          <p role="status" className="mt-2 text-muted">
            If an account exists for{" "}
            <strong className="font-semibold text-ink">{sentTo}</strong>, we
            sent a link to reset your password. It works for 1 hour.
          </p>
          <p className="mt-2 text-sm text-muted">
            Cannot find it? Check your spam folder.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn btn-primary">
              Back to log in
            </Link>
            <button
              type="button"
              onClick={() => setSentTo("")}
              className="btn btn-quiet"
            >
              Use a different email
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Forgot your password?
          </h1>
          <p className="mt-2 text-muted">
            Enter your university email and we will send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p
                role="alert"
                className="rounded-(--radius-control) bg-danger-wash px-3.5 py-3 text-sm text-danger"
              >
                {error}
              </p>
            )}

            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Remembered it?{" "}
            <Link
              to="/login"
              className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-brand"
            >
              Log in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
