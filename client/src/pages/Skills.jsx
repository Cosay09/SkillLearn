/*
    Jim push korbe
*/

import { useEffect, useState } from "react";
import {
  addMySkill,
  createSkill,
  getMySkills,
  listSkills,
  removeMySkill,
} from "../api/skills";
import { getAvailability } from "../api/users";
import AvailabilityPanel from "../components/AvailabilityPanel";
import SkillPanel from "../components/SkillPanel";

export default function Skills() {
  const [status, setStatus] = useState("loading"); // loading, ready or error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [allSkills, setAllSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.all([listSkills(), getMySkills(), getAvailability()])
      .then(([all, mine, availability]) => {
        if (!active) return;
        setAllSkills(all.skills);
        setMySkills(mine.skills);
        setSlots(availability.slots);
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

  // Use the skill if it exists, create it if it does not, then add it to the student
  async function addSkill({ name, type, level }) {
    let skill = allSkills.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );

    if (!skill) {
      skill = (await createSkill(name)).skill;
      setAllSkills((current) =>
        [...current, skill].sort((a, b) => a.name.localeCompare(b.name)),
      );
    }

    const { skill: added } = await addMySkill({
      skillId: skill.id,
      type,
      level,
    });
    setMySkills((current) => [...current, added]);
  }

  async function removeSkill(id) {
    await removeMySkill(id);
    setMySkills((current) => current.filter((s) => s.id !== id));
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Your skills
      </h1>
      <p className="mt-2 max-w-[60ch] text-muted">
        Matching uses these two lists and your free times to rank tutors for
        you.
      </p>

      {status === "loading" && (
        <p role="status" className="mt-10 text-muted">
          Loading your skills...
        </p>
      )}

      {status === "error" && (
        <div className="mt-10 rounded-(--radius-panel) border border-line bg-surface p-6">
          <p role="alert" className="text-danger">
            {error}
          </p>
          <button type="button" onClick={retry} className="btn btn-quiet mt-4">
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SkillPanel
              title="I can teach"
              hint="Students who want these skills can find you."
              emptyText="You have not added anything you can teach yet."
              type="offer"
              items={mySkills.filter((s) => s.type === "offer")}
              allSkills={allSkills}
              onAdd={addSkill}
              onRemove={removeSkill}
            />
            <SkillPanel
              title="I want to learn"
              hint="We rank tutors for these skills."
              emptyText="You have not added anything you want to learn yet."
              type="want"
              items={mySkills.filter((s) => s.type === "want")}
              allSkills={allSkills}
              onAdd={addSkill}
              onRemove={removeSkill}
            />
          </div>

          <AvailabilityPanel initialSlots={slots} />
        </>
      )}
    </div>
  );
}