"use client";

import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";
import { Profile } from "@/types/supabase";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  hasProfile: boolean | null;
  profile: Profile | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    hasProfile: null,
    profile: null,
  });
  const lastUserIdRef = useRef<string | null>(null);

  const checkUserProfile = useCallback(async (user: User) => {
    try {
      const { data, error, count } = await supabase
        .from("user_profile")
        .select("*", { count: "exact" })
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking user profile:", error);
        setState((prev) => ({
          ...prev,
          hasProfile: true,
          profile: null,
          loading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        hasProfile: count !== 0,
        profile: count !== 0 ? (data as Profile) : null,
        loading: false,
      }));
    } catch (error) {
      console.error("Unexpected error checking user profile:", error);
      setState((prev) => ({
        ...prev,
        hasProfile: true,
        profile: null,
        loading: false,
        error: error as AuthError,
      }));
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("onAuthStateChange", event, session);

      const user = session?.user || null;

      if (user && (event === "INITIAL_SESSION" || event === "USER_UPDATED")) {
        lastUserIdRef.current = user.id;
        setState((prev) => ({ ...prev, user, loading: !!user }));
        checkUserProfile(user);
      } else if (user && event === "SIGNED_IN") {
        if (user.id !== lastUserIdRef.current) {
          lastUserIdRef.current = user.id;
          setState((prev) => ({ ...prev, user, loading: true }));
          checkUserProfile(user);
        }
      } else {
        lastUserIdRef.current = null;
        setState((prev) => ({
          ...prev,
          user: null,
          hasProfile: null,
          profile: null,
          loading: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserProfile]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
