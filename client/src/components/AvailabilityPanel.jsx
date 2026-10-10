/*
    Jim push korbe
*/

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { saveAvailability } from "../api/users";

// 0 = Sunday, matching the database. Shown Saturday first, as the week starts in Bangladesh.
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

let keyCounter = 0;
const withKey = (slot) => ({ ...slot, key: ++keyCounter });

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function AvailabilityPanel({ initialSlots }) {
  const [slots, setSlots] = useState(() => initialSlots.map(withKey));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const totalMinutes = slots.reduce((sum, slot) => {
    if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime)
      return sum;
    return sum + toMinutes(slot.endTime) - toMinutes(slot.startTime);
  }, 0);

  function change(next) {
    setSlots(next);
    setMessage({ type: "", text: "" });
  }

  function addSlot(day) {
    change([
      ...slots,
      withKey({ dayOfWeek: day, startTime: "16:00", endTime: "18:00" }),
    ]);
  }

  function updateSlot(key, field, value) {
    change(
      slots.map((slot) =>
        slot.key === key ? { ...slot, [field]: value } : slot,
      ),
    );
  }

  function removeSlot(key) {
    change(slots.filter((slot) => slot.key !== key));
  }

  async function handleSave() {
    const bad = slots.find(
      (s) => !s.startTime || !s.endTime || s.startTime >= s.endTime,
    );
    if (bad) {
      setMessage({
        type: "error",
        text: `${DAY_NAMES[bad.dayOfWeek]}: the end time must be after the start time.`,
      });
      return;
    }

    setSaving(true);
    try {
      await saveAvailability(
        slots.map(({ dayOfWeek, startTime, endTime }) => ({
          dayOfWeek,
          startTime,
          endTime,
        })),
      );
      setMessage({ type: "success", text: "Free times saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-(--radius-panel) border border-line bg-surface p-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        Weekly free times
      </h2>
      <p className="mt-1 max-w-[60ch] text-muted">
        Matching favours students who are free at the same hours as you. Add
        every window you could meet in a normal week.
      </p>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {DAY_ORDER.map((day) => {
          const daySlots = slots.filter((slot) => slot.dayOfWeek === day);
          return (
            <div
              key={day}
              className="grid gap-3 py-4 sm:grid-cols-[8rem_1fr_auto] sm:items-start"
            >
              <p className="pt-2 font-medium">{DAY_NAMES[day]}</p>

              <div className="space-y-2">
                {daySlots.length === 0 && (
                  <p className="pt-2 text-sm text-muted">Not free</p>
                )}
                {daySlots.map((slot) => (
                  <div key={slot.key} className="flex items-center gap-2">
                    <input
                      type="time"
                      aria-label={`${DAY_NAMES[day]} start time`}
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(slot.key, "startTime", e.target.value)
                      }
                      className="field h-10"
                    />
                    <span className="text-sm text-muted">to</span>
                    <input
                      type="time"
                      aria-label={`${DAY_NAMES[day]} end time`}
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(slot.key, "endTime", e.target.value)
                      }
                      className="field h-10"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.key)}
                      aria-label={`Remove ${DAY_NAMES[day]} time`}
                      className="btn btn-quiet btn-sm px-3"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSlot(day)}
                aria-label={`Add time on ${DAY_NAMES[day]}`}
                className="btn btn-quiet btn-sm"
              >
                Add time
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Save free times"}
        </button>
        <p className="text-sm text-muted tabular-nums">
          About {Math.round((totalMinutes / 60) * 10) / 10} hours a week
        </p>
        {message.text && (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`text-sm font-medium ${message.type === "error" ? "text-danger" : "text-brand"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}