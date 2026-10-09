/*
    Jim push korbe
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      panelTitle="Welcome back."
      panelText="Your matches, requests and sessions are in one place."
    >
      <h1 className="text-3xl font-bold tracking-tight">Log in</h1>
      <p className="mt-2 text-muted">
        Use the email and password you signed up with.
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
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link
          to="/register"
          className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-brand"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
