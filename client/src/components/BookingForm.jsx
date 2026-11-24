import { useState } from "react";
import { createSession } from "../api/sessions";
import FormField from "./FormField";

export default function BookingForm({ request, onBooked, onClose }) {
  const [form, setForm] = useState({
    date: "",
    start: "16:00",
    end: "17:00",
    place: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd in the local timezone

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function submit(e) {
    e.preventDefault();

    // The inputs are local time; toISOString turns them into the UTC text the API expects
    const start = new Date(`${form.date}T${form.start}`);
    const end = new Date(`${form.date}T${form.end}`);
    if (end <= start) {
      setError("The end time must be after the start time.");
      return;
    }

    setBusy(true);
    try {
      await createSession({
        matchRequestId: request.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        meetingInfo: form.place.trim() || undefined,
      });
      onBooked();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 border-t border-line pt-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Date"
          name="date"
          type="date"
          min={today}
          value={form.date}
          onChange={change}
          required
        />
        <FormField
          label="Start time"
          name="start"
          type="time"
          value={form.start}
          onChange={change}
          required
        />
        <FormField
          label="End time"
          name="end"
          type="time"
          value={form.end}
          onChange={change}
          required
        />
      </div>
      <div className="mt-4">
        <FormField
          label="Place or link (optional)"
          name="place"
          value={form.place}
          onChange={change}
          maxLength={200}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-(--radius-control) bg-danger-wash px-3.5 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Booking..." : "Book session"}
        </button>
        <button type="button" onClick={onClose} className="btn btn-quiet">
          Close
        </button>
      </div>
    </form>
  );
}
