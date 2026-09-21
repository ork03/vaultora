import { createContext, useCallback, useEffect, useState } from "react";
import { authService } from "../features/auth/authService";
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    authService
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setStatus("ready"));
  }, []);
  const login = useCallback(async (c) => {
    const u = await authService.login(c);
    setUser(u);
    return u;
  }, []);
  const register = useCallback(async (c) => {
    const u = await authService.register(c);
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
