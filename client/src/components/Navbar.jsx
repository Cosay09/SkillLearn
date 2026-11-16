/*
    Mahadi push korbe
*/

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SwapMark from "./SwapMark";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/skills", label: "Skills" },
  { to: "/profile", label: "Profile" },
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

const linkClass = ({ isActive }) =>
  `inline-flex shrink-0 rounded-(--radius-control) px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? "bg-surface text-ink" : "text-muted hover:text-ink"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const verified = Boolean(user?.emailVerifiedAt);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="border-b border-line bg-canvas">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-2.5"
        >
          <SwapMark size={18} />
          <span className="font-display text-xl font-bold tracking-tight">
            SkillLearn
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            {verified && (
              <div className="hidden items-center gap-1 sm:flex">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
            <span
              role="img"
              aria-label={user.name}
              className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-xs font-semibold sm:flex"
            >
              {initials(user.name)}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-quiet btn-sm"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className={(state) => `hidden sm:inline-flex ${linkClass(state)}`}
            >
              Log in
            </NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">
              Create account
            </Link>
          </div>
        )}
      </nav>

      {user && (
        <div className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 sm:hidden">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
