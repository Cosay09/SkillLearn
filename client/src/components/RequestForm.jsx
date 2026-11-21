import { useState } from "react";
import { createRequest } from "../api/requests";

// `skills` is the list this student can still be asked for: [{ id, name }]
export default function RequestForm({ receiverId, skills, onSent }) {
  const [skillId, setSkillId] = useState(String(skills[0].id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // The chosen skill leaves the list once it has been requested
  const chosen = skills.some((s) => String(s.id) === skillId)
    ? skillId
    : String(skills[0].id);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await createRequest({ receiverId, skillId: Number(chosen) });
      onSent(Number(chosen));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {skills.length > 1 ? (
          <select
            aria-label="Skill to ask for"
            value={chosen}
            onChange={(e) => setSkillId(e.target.value)}
            className="field h-11 sm:w-56"
          >
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted">
            Ask for{" "}
            <strong className="font-semibold text-ink">{skills[0].name}</strong>
          </p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Sending..." : "Send request"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
