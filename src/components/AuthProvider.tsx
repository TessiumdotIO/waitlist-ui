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
  //   const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setIsTwitterConnected(false);
        setAuthReady(true);
        return;
      }

      // Do NOT hydrate here
      setAuthReady(true);
    };

    init();

    // Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setUser(null);
        setIsTwitterConnected(false);
        return;
      }

      const authUser = session.user;

      // Ensure DB user exists
      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!dbUser) {
        await supabase.from("users").insert({
          id: authUser.id,
          email: authUser.email,
          display_name: generateDisplayName(authUser.id),
          avatar_url: authUser.user_metadata.avatar_url ?? null,
          referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        });
      }

      // Handle referral ONCE
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) {
        await supabase.rpc("handle_referral", {
          p_referral_code: ref,
          p_new_user_id: authUser.id,
        });
      }

      // Final hydration
      await hydrateUser(authUser.id);
    });

    return () => subscription.unsubscribe();
  }, [hydrateUser, user]);

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
      value={{ user, setUser, authReady, refresh, isTwitterConnected }}
    >
      {children}
    </AuthContext.Provider>
  );
};
