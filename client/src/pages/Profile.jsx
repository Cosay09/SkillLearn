/*
    Jim push korbe
*/

import { useState } from "react";
import { updateProfile } from "../api/users";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    department: user.department ?? "",
    year: user.year ?? "",
    bio: user.bio ?? "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await updateProfile({
        name: form.name.trim(),
        department: form.department.trim() || null,
        year: form.year ? Number(form.year) : null,
        bio: form.bio.trim() || null,
      });
      updateUser(updated);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Your profile
      </h1>
      <p className="mt-2 max-w-[60ch] text-muted">
        Other students see your name, department, year and bio before they send
        you a request.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl space-y-5 rounded-(--radius-panel) border border-line bg-surface p-6 sm:p-8"
      >
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
          value={user.email}
          hint="Your email cannot be changed yet."
          disabled
          readOnly
        />
        <FormField
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          maxLength={100}
        />
        <FormField
          as="select"
          label="Year"
          name="year"
          value={form.year}
          onChange={handleChange}
        >
          <option value="">Not set</option>
          <option value="1">1st year</option>
          <option value="2">2nd year</option>
          <option value="3">3rd year</option>
          <option value="4">4th year</option>
        </FormField>
        <FormField
          as="textarea"
          label="Bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          maxLength={500}
          hint={`${form.bio.length} of 500 characters`}
        />

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : "Save profile"}
          </button>
          {message.text && (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={`text-sm font-medium ${message.type === "error" ? "text-danger" : "text-brand"}`}
            >
              {message.text}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}