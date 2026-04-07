import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email?: string | null;
  password?: string | null;
  code: string | null;
  phone_number: string | null;
  address: string | null;
  kyc_status: string;
  bank_network: string | null;
  bank_account: string | null;
  bank_name: string | null;
  avatar_url: string | null;
  balance: number;
  is_admin: boolean;
  updated_at: string;
}

// Mocking Session and User internally so that depending files don't break as much
export interface LocalUser {
  id: string;
  email?: string;
  user_metadata?: any;
}

export interface LocalSession {
  user: LocalUser | null;
  access_token?: string;
}

interface AuthContextType {
  session: LocalSession | null;
  user: LocalUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  isProfileLoading: boolean;
  refreshProfile: () => Promise<void>;
  login: (profile: Profile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setIsProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        setProfile(null);
        setIsAdmin(false);
        // If profile fetch fails, logout
        handleLogout();
      } else {
        setProfile(data);
        setIsAdmin(data.is_admin || false);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const handleLogin = (newProfile: Profile) => {
    const localUser: LocalUser = { id: newProfile.id, email: newProfile.email || undefined };
    const localSession: LocalSession = { user: localUser };
    
    // Save to local storage
    localStorage.setItem("metastock_user_id", newProfile.id);

    setProfile(newProfile);
    setIsAdmin(newProfile.is_admin || false);
    setUser(localUser);
    setSession(localSession);
  };

  const handleLogout = () => {
    localStorage.removeItem("metastock_user_id");
    setProfile(null);
    setIsAdmin(false);
    setUser(null);
    setSession(null);
  };

  useEffect(() => {
    const init = async () => {
      const storedUserId = localStorage.getItem("metastock_user_id");
      if (storedUserId) {
        // Setup initial user state so UI feels responsive
        const localUser: LocalUser = { id: storedUserId };
        setUser(localUser);
        setSession({ user: localUser });
        
        await fetchProfile(storedUserId);
      } else {
        setProfile(null);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAdmin,
        loading,
        isProfileLoading,
        refreshProfile,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
