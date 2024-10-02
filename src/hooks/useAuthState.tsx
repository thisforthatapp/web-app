import { useState, useEffect } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";

interface UserProfile {
  id: string;
  // Add other profile fields here
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  hasProfile: boolean | null;
  profile: UserProfile | null;
}

interface UseAuthStateOptions {
  checkProfile?: boolean;
}

const useAuthState = (options: UseAuthStateOptions = {}): AuthState => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    hasProfile: null,
    profile: null,
  });

  useEffect(() => {
    const checkUserProfile = async (user: User) => {
      try {
        const { data, error, count } = await supabase
          .from("user_profile")
          .select("*", { count: "exact" })
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          hasProfile: count !== 0,
          profile: count !== 0 ? (data as UserProfile) : null,
          loading: false,
        }));
      } catch (error) {
        console.error("Error checking user profile:", error);
        setState((prev) => ({
          ...prev,
          hasProfile: false,
          profile: null,
          loading: false,
          error: error as AuthError,
        }));
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setState((prev) => ({
        ...prev,
        user,
        loading: !!user && !!options.checkProfile,
      }));

      if (user && options.checkProfile) {
        checkUserProfile(user);
      } else {
        setState((prev) => ({
          ...prev,
          user,
          hasProfile: null,
          profile: null,
          loading: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [options.checkProfile]);

  return state;
};

export default useAuthState;
