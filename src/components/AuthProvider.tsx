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
      const { error: syncError } = await supabase.rpc("sync_points", {
        p_user_id: id,
      });

      if (syncError) {
        console.error("❌ Sync points error:", syncError);
      }

      // Fetch updated user data
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Fetch user error:", error);
        throw error;
      }

      console.log("✅ User data fetched:", data);
      setUser(data);
    } catch (error) {
      console.error("❌ Error hydrating user:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("🔍 Starting auth initialization...");

        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authUser = session?.user;

        console.log("📧 Auth user:", authUser?.email, authUser?.id);

        if (!authUser) {
          console.log("❌ No auth user found");
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
        const { data: dbUser, error } = await supabase
          .from("users")
          .select("id")
          .eq("id", authUser.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

        if (error) {
          throw error;
        }

        console.log("💾 DB user exists:", !!dbUser, error);

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

          if (insertError && insertError.code !== "23505") {
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

        // Load user data
        console.log("💧 Loading user data...");
        await hydrateUser(authUser.id);

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
        console.error("❌ Init error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        setIsTwitterConnected(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const connected = authData.user?.identities?.some(
        (i) => i.provider === "twitter"
      );
      setIsTwitterConnected(!!connected);

      // Always hydrate — no conditions
      await hydrateUser(session.user.id);

      // Handle twitter connect safely
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
          console.log("📡 Real-time update:", payload.new);
          setUser(payload.new as User);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, user]);

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
  }, [user?.id, user]);

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
