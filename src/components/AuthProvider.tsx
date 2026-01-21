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
      console.log("💧 Hydrating user:", id);

      // Sync points first
      const syncRes = await supabase.rpc("sync_points", {
        p_user_id: id,
      });

      if (syncRes?.error) {
        console.error("❌ Sync points error:", syncRes.error);
      } else {
        console.log("🔁 sync_points result:", syncRes);
      }

      // Fetch updated user data (use maybeSingle to avoid throwing when no row)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("❌ Fetch user error:", error);
        setUser(null);
        return false;
      }

      if (!data) {
        console.warn("⚠️ No user row found for id during hydrate:", id);
        setUser(null);
        return false;
      }

      console.log("✅ User data fetched:", data);
      setUser(data as User);
      return true;
    } catch (error) {
      console.error("Error hydrating user:", error);
      setUser(null);
      return false;
    }
  }, []);

  // Helper to run a promise with a timeout so we don't stay stuck on network hangs
  const runWithTimeout = useCallback(
    async <T,>(promise: Promise<T>, ms = 8000): Promise<T> => {
      let timer: ReturnType<typeof setTimeout>;
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error("timeout")), ms);
        }),
      ]).finally(() => clearTimeout(timer));
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🔍 Starting auth initialization...");

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authUser = session?.user;

        console.log("📧 Auth user:", authUser?.email, authUser?.id);

        // Diagnostic: show stored token (if any) to help debug persistence issues
        try {
          const stored =
            typeof window !== "undefined"
              ? window.localStorage.getItem("supabase.auth.token")
              : null;
          console.log("📦 Stored supabase.auth.token (raw):", stored);
        } catch (e) {
          console.warn("Could not read localStorage for debug:", e);
        }

        if (!authUser) {
          console.log("❌ No auth user found");

          // If there's a leftover token in localStorage but getSession returned
          // null, it might be corrupted or expired and preventing proper
          // restoration. Clear it and log for debugging. This handles cases
          // where users must clear cache to recover.
          try {
            const stored =
              typeof window !== "undefined"
                ? window.localStorage.getItem("supabase.auth.token")
                : null;

            if (stored) {
              try {
                JSON.parse(stored);
                console.warn(
                  "⚠️ Found stored supabase token but no active session — clearing token to recover"
                );
              } catch (e) {
                console.warn(
                  "⚠️ Supabase token in localStorage appears corrupted — removing it",
                  e
                );
              }

              window.localStorage.removeItem("supabase.auth.token");
              // Also try to clear any internal state
              try {
                await supabase.auth.signOut();
              } catch (e) {
                console.warn("Error signing out while clearing token:", e);
              }

              // Retry getSession once after clearing token to see if session can be restored
              try {
                const retry = await supabase.auth.getSession();
                console.log("🔁 After clearing token, getSession():", retry);
              } catch (e) {
                console.warn("Retry getSession failed:", e);
              }
            }
          } catch (e) {
            console.error("Error checking localStorage for supabase token:", e);
          }

          setLoading(false);
          return;
        }

        // Check Twitter connection
        const { data: userData } = await supabase.auth.getUser();
        const connected = userData.user?.identities?.some(
          (i) => i.provider === "twitter"
        );
        setIsTwitterConnected(!!connected);
        console.log("🐦 Twitter connected:", connected);

        // Check if user exists in database
        console.log("🔍 Checking if user exists in DB...");
        const { data: dbUser, error: fetchError } = await supabase
          .from("users")
          .select("id")
          .eq("id", authUser.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

        console.log("💾 DB user exists:", !!dbUser, fetchError);

        // Create user if doesn't exist
        if (!dbUser) {
          console.log("📝 Creating new user in database...");

          const referralCode = Math.random()
            .toString(36)
            .slice(2, 10)
            .toUpperCase();

          const newUser = {
            id: authUser.id,
            email: authUser.email,
            display_name: generateDisplayName(authUser.id),
            avatar_url: authUser.user_metadata.avatar_url || null,
            referral_code: referralCode,
            points_rate: 0.1,
            points: 0,
            twitter_connected: false,
            tasks_completed: [],
            referral_count: 0,
          };

          console.log("📝 Inserting user:", newUser);

          const { data: insertedUser, error: insertError } = await supabase
            .from("users")
            .insert(newUser)
            .select()
            .single();

          if (insertError) {
            console.error("❌ Insert error:", insertError);
            console.error(
              "❌ Insert error details:",
              JSON.stringify(insertError, null, 2)
            );

            // Try to give user more info about what went wrong
            if (insertError.code === "23505") {
              console.error(
                "❌ Duplicate key - user might already exist or referral code collision"
              );
            } else if (insertError.code === "23503") {
              console.error(
                "❌ Foreign key violation - auth user might not exist"
              );
            } else if (insertError.message?.includes("policy")) {
              console.error(
                "❌ RLS policy blocking insert - need to fix permissions"
              );
            }

            throw insertError;
          }

          console.log("✅ User created successfully:", insertedUser);
        }

        // Load user data (with timeout to avoid getting stuck)
        console.log("💧 Loading user data...");
        try {
          await runWithTimeout(hydrateUser(authUser.id), 8000);
        } catch (e) {
          console.warn("Hydrate user timed out or failed:", e);
          setUser(null);
        }

        // Handle referral if present
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) {
          console.log("🎁 Processing referral code:", ref);
          const { error: refError } = await supabase.rpc("handle_referral", {
            p_referral_code: ref,
            p_new_user_id: authUser.id,
          });

          if (refError) {
            console.error("❌ Referral error:", refError);
          } else {
            console.log("✅ Referral processed");
            await hydrateUser(authUser.id);
          }
        }

        console.log("🎉 Initialization complete");
      } catch (error) {
        console.error(" Init error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Auth state listener — subscribe first so we don't miss events that
    // happen during URL-based OAuth redirects (detectSessionInUrl)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("🔄 Auth state changed:", event);

        if (!session) {
          // Signed out or no session
          setUser(null);
          setIsTwitterConnected(false);
          setLoading(false);
          return;
        }

        // Refresh user data from DB (use timeout wrapper)
        try {
          await runWithTimeout(hydrateUser(session.user.id), 8000);
        } catch (e) {
          console.warn("Hydrate user (auth handler) timed out or failed:", e);
          setUser(null);
        }

        // Re-check identities from auth service
        const { data: userData } = await supabase.auth.getUser();
        const connected = userData.user?.identities?.some(
          (i) => i.provider === "twitter"
        );
        setIsTwitterConnected(!!connected);

        // If Twitter just connected, update database by fetching a fresh user
        if (event === "SIGNED_IN" && connected) {
          const { data: freshUser } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (freshUser && !freshUser.twitter_connected) {
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
      } catch (err) {
        console.error("Error in auth state handler:", err);
      } finally {
        setLoading(false);
      }
    });

    // Now run initialization flow
    init();

    return () => subscription.unsubscribe();
  }, [hydrateUser, runWithTimeout]);

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
          console.log("📡 Real-time update:", payload.new);
          setUser(payload.new as User);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Auto-save points every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await supabase.rpc("sync_points", { p_user_id: user.id });
      } catch (error) {
        console.error("❌ Auto-save error:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

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
