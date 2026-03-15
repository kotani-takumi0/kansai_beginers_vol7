import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse, AuthSession, AuthUser } from "../types";
import { fetchCurrentUser, loginUser, registerUser } from "../utils/authApi";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "../utils/authStorage";

type AuthContextValue = {
  readonly session: AuthSession | null;
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly isBootstrapping: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly register: (displayName: string, email: string, password: string) => Promise<void>;
  readonly logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(response: AuthResponse, setSession: (session: AuthSession | null) => void) {
  const nextSession: AuthSession = {
    token: response.token,
    user: response.user,
  };

  saveAuthSession(nextSession);
  setSession(nextSession);
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadAuthSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const currentSession = loadAuthSession();

    if (!currentSession) {
      setIsBootstrapping(false);
      return;
    }

    void fetchCurrentUser(currentSession.token)
      .then((user) => {
        const refreshedSession: AuthSession = {
          token: currentSession.token,
          user,
        };
        saveAuthSession(refreshedSession);
        setSession(refreshedSession);
      })
      .catch(() => {
        clearAuthSession();
        setSession(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isBootstrapping,
      async login(email: string, password: string) {
        const response = await loginUser({ email, password });
        applySession(response, setSession);
      },
      async register(displayName: string, email: string, password: string) {
        const response = await registerUser({ displayName, email, password });
        applySession(response, setSession);
      },
      logout() {
        clearAuthSession();
        setSession(null);
      },
    }),
    [isBootstrapping, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
