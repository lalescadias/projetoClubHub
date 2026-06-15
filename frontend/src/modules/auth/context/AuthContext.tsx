import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import { applyClubTheme } from "../../clubs/services/club-theme";
import { sessionStorage } from "../services/session.storage";
import type { Membership, SessionUser } from "../types/auth";

type AuthContextValue = {
  user: SessionUser | null;
  activeMembership: Membership | null;
  activeRole: SessionUser["role"] | null;
  activeClub: SessionUser["club"];
  loading: boolean;
  login: (club: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applyUser = useCallback((nextUser: SessionUser) => {
    setUser(nextUser);
  }, []);

  const refreshSession = useCallback(async () => {
    applyUser(await authApi.me());
  }, [applyUser]);

  useEffect(() => {
    const restore = async () => {
      if (!sessionStorage.getToken()) {
        setLoading(false);
        return;
      }

      try {
        await refreshSession();
      } catch {
        sessionStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void restore();
  }, [refreshSession]);

  const login = async (club: string, email: string, password: string) => {
    const session = await authApi.login(club, email, password);
    sessionStorage.setToken(session.accessToken);
    applyUser(session.user);
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  const activeMembership = user?.membership ?? null;
  const activeRole = user?.role ?? null;
  const activeClub = user?.club ?? null;

  useEffect(() => {
    applyClubTheme(activeClub?.themeColor);
  }, [activeClub?.themeColor]);

  const value = useMemo(
    () => ({
      user,
      activeMembership,
      activeRole,
      activeClub,
      loading,
      login,
      logout,
      refreshSession,
    }),
    [activeClub, activeMembership, activeRole, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
