import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [view, setView] = useState(token ? "form" : "invalid"); // form, done or invalid
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, password: form.password });
      setView("done");
    } catch (err) {
      if (err.code === "INVALID_TOKEN") {
        setView("invalid");
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      panelTitle="Almost done."
      panelText="Choose a new password and you can get back to your matches."
    >
      {view === "invalid" && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            This link did not work
          </h1>
          <p role="alert" className="mt-2 text-muted">
            It may have expired, or it was already used. Request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary mt-8">
            Request a new link
          </Link>
        </>
      )}

      {view === "done" && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Password updated
          </h1>
          <p role="status" className="mt-2 text-muted">
            You can now log in with your new password.
          </p>
          <Link to="/login" className="btn btn-primary mt-8">
            Log in
          </Link>
        </>
      )}

      {view === "form" && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">
            Choose a new password
          </h1>
          <p className="mt-2 text-muted">
            Pick something you have not used on other sites.
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
              label="New password"
              hint="At least 8 characters"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <FormField
              label="Confirm password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? "Saving..." : "Save new password"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
