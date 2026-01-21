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
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

  /**
   * Fetch user from DB (DB user is guaranteed to exist)
   */
  const hydrateUser = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Failed to hydrate user:", error);
        return;
      }

      setUser(data);
    } catch (err) {
      console.error("❌ Unexpected hydrate error:", err);
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
          setLoading(false);
          return;
        }

        // Twitter connection state
        const { data: authData } = await supabase.auth.getUser();
        const connected =
          authData.user?.identities?.some((i) => i.provider === "twitter") ??
          false;

        setIsTwitterConnected(connected);

        // DB user always exists
        await hydrateUser(session.user.id);

        // Handle referral once on initial load
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

    /**
     * Auth state listener
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setIsTwitterConnected(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const connected =
        authData.user?.identities?.some((i) => i.provider === "twitter") ??
        false;

      setIsTwitterConnected(connected);

      await hydrateUser(session.user.id);

      // Twitter connect handling
      if (connected) {
        const twitter = authData.user?.identities?.find(
          (i) => i.provider === "twitter"
        );

        if (twitter) {
          await supabase.rpc("connect_twitter", {
            p_user_id: session.user.id,
            p_twitter_username: twitter.identity_data?.user_name,
            p_twitter_avatar: twitter.identity_data?.avatar_url,
          });

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
    if (!user) return;

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
        refresh,
        isTwitterConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
