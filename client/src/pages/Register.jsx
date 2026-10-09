/*
    Jim push korbe
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      panelTitle="Two lists get you started."
      panelText="What you can teach and what you want to learn. Matching takes it from there."
    >
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted">Add your skills once you are in.</p>

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
          label="Name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          required
        />
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
          hint="At least 8 characters"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-brand"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
