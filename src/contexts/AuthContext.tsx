import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
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

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  isProfileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
  // Track last fetched user to avoid redundant calls during initialization
  const lastFetchedUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    // If the same user's profile is already being fetched or is done, skip if not called via refreshProfile
    if (lastFetchedUserId.current === userId && profile && !isProfileLoading) return;
    
    lastFetchedUserId.current = userId;
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
      } else {
        setProfile(data);
        setIsAdmin(data.is_admin);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      lastFetchedUserId.current = null; // Force fetch
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Aggressive safety timeout to ensure app always renders
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      setIsProfileLoading(false);
    }, 5000);

    const handleAuthStateChange = async (currentSession: Session | null) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Only fetch if session changed or was initialized
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
        lastFetchedUserId.current = null;
      }
      setLoading(false);
    };

    // Initialize session and listener
    const init = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await handleAuthStateChange(initialSession);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          // Avoid double processing if handleAuthStateChange from initial getSession is still running
          handleAuthStateChange(newSession);
        }
      );

      return subscription;
    };

    const subscriptionPromise = init();

    return () => {
      subscriptionPromise.then(sub => sub.unsubscribe());
      clearTimeout(safetyTimeout);
    };
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
