/*
    Jim push korbe
*/

import { Link } from "react-router-dom";
import MatchPreview from "../components/MatchPreview";

const steps = [
  {
    title: "Add your skills",
    text: "Say what you can teach and what you want to learn, and when you are free each week.",
  },
  {
    title: "Review your matches",
    text: "See students ranked by shared skills, rating and overlapping free time.",
  },
  {
    title: "Book a session",
    text: "Send a request. Once it is accepted, pick a time that suits you both.",
  },
  {
    title: "Rate each other",
    text: "After the session, leave a rating and a short review.",
  },
];

export default function Landing() {
  return (
    <div>
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <h1
            className="rise-in text-5xl font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[3.75rem]"
            style={{ "--i": 0 }}
          >
            Teach one skill. Learn another.
          </h1>
          <p
            className="rise-in mt-6 max-w-[46ch] text-lg text-muted"
            style={{ "--i": 1 }}
          >
            SkillLearn ranks students who can teach what you want to learn by
            skills, rating and shared free time.
          </p>
          <div
            className="rise-in mt-8 flex flex-wrap gap-3"
            style={{ "--i": 2 }}
          >
            <Link to="/register" className="btn btn-primary">
              Create account
            </Link>
            <Link to="/login" className="btn btn-quiet">
              Log in
            </Link>
          </div>
        </div>

        <MatchPreview />
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          From a profile to a booked session
        </h2>
        <ol className="space-y-10 border-l border-line">
          {steps.map((step) => (
            <li key={step.title} className="relative pl-8">
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-brand"
              />
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-[56ch] text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24 flex flex-col gap-8 rounded-(--radius-panel) bg-band px-6 py-10 text-on-band sm:flex-row sm:items-center sm:justify-between sm:px-12 sm:py-14">
        <h2 className="max-w-[22ch] text-3xl font-bold tracking-tight sm:text-4xl">
          Add your skills and see who matches.
        </h2>
        <Link to="/register" className="btn btn-accent self-start sm:self-auto">
          Create account
        </Link>
      </section>
    </div>
  );
}
