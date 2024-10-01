import { useState, useEffect } from "react";
import { User, AuthError, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseClient";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

const useAuthState = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setState((prev) => ({ ...prev, user, loading: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as AuthError,
          loading: false,
        }));
      }
    };

    getCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }));
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return state;
};

export default useAuthState;
