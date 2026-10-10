/*
    Jim push korbe
*/

import { useState } from "react";
import FormField from "./FormField";

const levelLabel = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function SkillPanel({
  title,
  hint,
  emptyText,
  type,
  items,
  allSkills,
  onAdd,
  onRemove,
}) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const offered = type === "offer";
  const listId = `skill-options-${type}`;
  const suggestions = allSkills.filter(
    (skill) => !items.some((item) => item.skillId === skill.id),
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onAdd({
        name: name.trim(),
        type,
        level: offered ? level : undefined,
      });
      setName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(id) {
    setError("");
    try {
      await onRemove(id);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="rounded-(--radius-panel) border border-line bg-surface p-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-muted">{hint}</p>

      {items.length === 0 ? (
        <p className="mt-5 rounded-(--radius-control) bg-canvas px-4 py-3 text-sm text-muted">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{item.skill.name}</p>
                {(offered || item.skill.category) && (
                  <p className="text-sm text-muted">
                    {offered ? levelLabel[item.level] : item.skill.category}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                aria-label={`Remove ${item.skill.name}`}
                className="btn btn-quiet btn-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <FormField
            label="Add a skill"
            list={listId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search, or type a new skill"
            minLength={2}
            maxLength={50}
            required
          />
          <datalist id={listId}>
            {suggestions.map((skill) => (
              <option key={skill.id} value={skill.name}>
                {skill.category}
              </option>
            ))}
          </datalist>
        </div>

        {offered && (
          <div className="sm:w-40">
            <FormField
              as="select"
              label="Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </FormField>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Adding..." : "Add"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-(--radius-control) bg-danger-wash px-3.5 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </section>
  );
}
