"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./AuthContext";
import { User } from "./types";
import { generateDisplayName } from "@/lib/nameGenerator";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

  const hydrateUser = useCallback(async (id: string) => {
    try {
      // Sync points first (if row exists; RPC will no-op if not)
      await supabase.rpc("sync_points", { p_user_id: id });

      // Fetch updated user data with .maybeSingle() to handle missing row gracefully
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setUser(data); // Will be null if no row, which is fine—we'll handle in UI
    } catch (error) {
      console.error("Error hydrating user:", error);
      setUser(null); // Ensure user is null on failure
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authUser = session?.user;

        if (!authUser) {
          setLoading(false);
          return;
        }

        // Check Twitter connection
        const { data: userData } = await supabase.auth.getUser();
        const connected = userData.user?.identities?.some(
          (i) => i.provider === "twitter"
        );
        setIsTwitterConnected(!!connected);

        // Check if user exists in database with .maybeSingle()
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", authUser.id)
          .maybeSingle();

        // Create user if doesn't exist, with retry for unique referral_code
        if (!dbUser) {
          let created = false;
          let attempts = 0;
          while (!created && attempts < 5) {
            const referralCode = Math.random()
              .toString(36)
              .slice(2, 10)
              .toUpperCase();

            const { error } = await supabase.from("users").insert({
              id: authUser.id,
              email: authUser.email,
              display_name: generateDisplayName(authUser.id),
              avatar_url: authUser.user_metadata.avatar_url,
              referral_code: referralCode,
              points_rate: 0.1,
            });

            if (!error) {
              created = true;
            } else if (error.code === "23505") {
              // Postgres unique violation
              console.warn(
                `Referral code collision on attempt ${
                  attempts + 1
                }: ${referralCode}`
              );
              attempts++;
            } else {
              throw error; // Other errors: bail out
            }
          }

          if (!created) {
            throw new Error(
              "Failed to create unique referral code after retries"
            );
          }
        }

        // Load user data
        await hydrateUser(authUser.id);

        // Handle referral if present
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
          await supabase.rpc("handle_referral", {
            p_referral_code: ref,
            p_new_user_id: authUser.id,
          });
          // Refresh user data after referral
          await hydrateUser(authUser.id);
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setUser(null);
        setIsTwitterConnected(false);
      } else {
        await hydrateUser(session.user.id);

        const { data: userData } = await supabase.auth.getUser();
        const connected = userData.user?.identities?.some(
          (i) => i.provider === "twitter"
        );
        setIsTwitterConnected(!!connected);

        // If Twitter just connected, update database
        if (
          event === "SIGNED_IN" &&
          connected &&
          user &&
          !user.twitter_connected
        ) {
          const twitterIdentity = userData.user?.identities?.find(
            (i) => i.provider === "twitter"
          );

          if (twitterIdentity) {
            await supabase.rpc("connect_twitter", {
              p_user_id: session.user.id,
              p_twitter_username: twitterIdentity.identity_data?.user_name,
              p_twitter_avatar: twitterIdentity.identity_data?.avatar_url,
            });
            await hydrateUser(session.user.id);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrateUser]);

  // Real-time subscription for user updates
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

  // Auto-save points every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await supabase.rpc("sync_points", { p_user_id: user.id });
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const refresh = useCallback(async () => {
    if (user) await hydrateUser(user.id);
  }, [user, hydrateUser]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, refresh, isTwitterConnected }}
    >
      {children}
    </AuthContext.Provider>
  );
};
