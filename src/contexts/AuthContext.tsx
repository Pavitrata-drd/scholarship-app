import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { loginApi, registerApi, fetchMe } from "@/lib/api";
import type { User } from "@/lib/api";
import { AuthContext } from "@/contexts/authContextDef";

const TOKEN_KEY = "scholarhub_token";

// ── Provider ───────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [isLoading, setIsLoading] = useState(!!token); // only loading if we have a stored token

  // Persist token
  const saveToken = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // On mount, if we have a stored token, fetch the user profile
  useEffect(() => {
    if (!token) return;

    fetchMe()
      .then((res) => setUser(res.data))
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    saveToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const res = await registerApi(fullName, email, password);
      saveToken(res.data.token);
      setUser(res.data.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
