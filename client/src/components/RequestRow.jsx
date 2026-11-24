import { useState } from "react";
import { Link } from "react-router-dom";
import { describePerson, formatDate } from "../utils/person";
import Avatar from "./Avatar";
import BookingForm from "./BookingForm";

const STATUS_LABEL = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

const STATUS_STYLE = {
  pending: "border border-line-strong text-muted",
  accepted: "bg-brand/15 text-brand",
  declined: "bg-canvas text-muted",
  cancelled: "bg-canvas text-muted",
};

// Renders one <li>, so it belongs inside a <ul>
export default function RequestRow({ request, direction, busy, onAction }) {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const incoming = direction === "incoming";
  const other = incoming ? request.requester : request.receiver;
  const pending = request.status === "pending";

  const name = (
    <Link
      to={`/users/${other.id}`}
      className="font-semibold underline-offset-4 hover:underline"
    >
      {other.name}
    </Link>
  );
  const skill = <span className="font-semibold">{request.skill.name}</span>;

  return (
    <li className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar name={other.name} />
          <div className="min-w-0">
            <p>
              {incoming ? (
                <>
                  {name} asked you to teach {skill}
                </>
              ) : (
                <>
                  You asked {name} to teach {skill}
                </>
              )}
            </p>
            <p className="text-sm text-muted">
              {[describePerson(other), formatDate(request.createdAt)]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-(--radius-control) px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[request.status]}`}
          >
            {STATUS_LABEL[request.status]}
          </span>

          {pending && incoming && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction(request, "accepted")}
                className="btn btn-primary btn-sm"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction(request, "declined")}
                className="btn btn-quiet btn-sm"
              >
                Decline
              </button>
            </>
          )}

          {pending && !incoming && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction(request, "cancelled")}
              className="btn btn-quiet btn-sm"
            >
              Cancel request
            </button>
          )}

          {request.status === "accepted" && !booking && (
            <button
              type="button"
              onClick={() => {
                setBooked(false);
                setBooking(true);
              }}
              className="btn btn-primary btn-sm"
            >
              Book session
            </button>
          )}
        </div>
      </div>

      {booked && (
        <p role="status" className="mt-4 text-sm font-medium text-brand">
          Session booked. See it on the{" "}
          <Link to="/sessions" className="underline underline-offset-4">
            Sessions
          </Link>{" "}
          page.
        </p>
      )}

      {booking && (
        <BookingForm
          request={request}
          onClose={() => setBooking(false)}
          onBooked={() => {
            setBooking(false);
            setBooked(true);
          }}
        />
      )}
    </li>
  );
}
