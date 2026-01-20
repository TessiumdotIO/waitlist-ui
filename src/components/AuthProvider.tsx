"use client";

import { ReactNode, useState, useEffect } from "react";
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

  const hydrateUser = async (id: string) => {
    // Optional: call RPC to sync points
    await supabase.rpc("sync_points", { p_user_id: id });

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    setUser(data);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;

      if (!authUser) {
        setLoading(false);
        return;
      }

      // Check if user exists
      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .single();

      if (!dbUser) {
        // Insert new user with default points_rate = 0.1
        await supabase.from("users").insert({
          id: authUser.id,
          display_name: generateDisplayName(authUser.id),
          avatar_url: authUser.user_metadata.avatar_url,
          referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
          points_rate: 0.1, // default points/sec
        });
      }

      await hydrateUser(authUser.id);

      // Handle referral if exists
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) {
        await supabase.rpc("handle_referral", {
          p_referral_code: ref,
          p_new_user_id: authUser.id,
        });
      }

      setLoading(false);
    };

    init();

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setUser(null);
      else hydrateUser(session.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    if (user) await hydrateUser(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};
