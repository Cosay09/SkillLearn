/*
    Jim push korbe
*/

import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" if there is a saved token to check
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem("token");
      setUser(null);
    });

    if (!localStorage.getItem("token")) return;

    // Restore the session after a page refresh
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  function saveSession({ token, user }) {
    localStorage.setItem("token", token);
    setUser(user);
  }

  async function login(credentials) {
    saveSession(await loginUser(credentials));
  }

  async function register(details) {
    saveSession(await registerUser(details));
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  function updateUser(updated) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
