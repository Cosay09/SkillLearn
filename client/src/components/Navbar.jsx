import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import SwapMark from "./SwapMark";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/matches", label: "Find tutors" },
  { to: "/requests", label: "Requests" },
  { to: "/skills", label: "Skills" },
  { to: "/profile", label: "Profile" },
];

const baseLink =
  "rounded-(--radius-control) px-3 py-2 text-sm font-medium transition-colors duration-150";
const stateClass = (isActive) =>
  isActive ? "bg-surface text-ink" : "text-muted hover:text-ink";
const linkClass = ({ isActive }) =>
  `inline-flex shrink-0 ${baseLink} ${stateClass(isActive)}`;
const guestLinkClass = ({ isActive }) =>
  `hidden sm:inline-flex ${baseLink} ${stateClass(isActive)}`;

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
              <div className="hidden items-center gap-1 lg:flex">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
            <Avatar
              name={user.name}
              size="sm"
              label={user.name}
              className="ml-1 hidden lg:flex"
            />
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
            <NavLink to="/login" className={guestLinkClass}>
              Log in
            </NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">
              Create account
            </Link>
          </div>
        )}
      </nav>

      {verified && (
        <div className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
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
