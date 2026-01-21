"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./AuthContext";
import { User } from "./types";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isValidUser, setIsValidUser] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

  /**
   * Fetch user from DB and handle non-existence
   */
  const hydrateUser = useCallback(async (userId: string) => {
    try {
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // ✅ maybeSingle avoids error if user deleted

      if (!dbUser) {
        setUser(null);
        setIsValidUser(false);
        setIsTwitterConnected(false);
        return null;
      } else {
        setUser(dbUser);
        setIsValidUser(true);
        return dbUser;
      }
    } catch (err) {
      console.error("❌ Unexpected hydrate error:", err);
      setUser(null);
      setIsValidUser(false);
      setIsTwitterConnected(false);
      return null;
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setUser(null);
          setIsValidUser(false);
          setLoading(false);
          return;
        }

        // Check Twitter connection
        const { data: authData } = await supabase.auth.getUser();
        const connected =
          authData.user?.identities?.some((i) => i.provider === "twitter") ??
          false;
        setIsTwitterConnected(connected);

        // Hydrate DB user
        const dbUser = await hydrateUser(session.user.id);
        if (!dbUser) {
          // Optional: sign out invalid session
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Handle referral
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
          await supabase.rpc("handle_referral", {
            p_referral_code: ref,
            p_new_user_id: session.user.id,
          });
        }
      } catch (err) {
        console.error("❌ Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setIsValidUser(false);
        setIsTwitterConnected(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const connected =
        authData.user?.identities?.some((i) => i.provider === "twitter") ??
        false;
      setIsTwitterConnected(connected);

      const dbUser = await hydrateUser(session.user.id);
      if (!dbUser) {
        // Optional: sign out invalid session
        await supabase.auth.signOut();
        return;
      }

      // Twitter connect handling
      if (connected) {
        const twitter = authData.user?.identities.find(
          (i) => i.provider === "twitter"
        );

        if (twitter) {
          await supabase.rpc("connect_twitter", {
            p_user_id: session.user.id,
            p_twitter_username: twitter.identity_data?.user_name,
            p_twitter_avatar: twitter.identity_data?.avatar_url,
          });

          // Refresh user after Twitter connect
          await hydrateUser(session.user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hydrateUser]);

  /**
   * Realtime DB updates
   */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setUser(payload.new as User);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    if (user?.id) {
      await hydrateUser(user.id);
    }
  }, [user?.id, hydrateUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isValidUser,
        refresh,
        isTwitterConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
