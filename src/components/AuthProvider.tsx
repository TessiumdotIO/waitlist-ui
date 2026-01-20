// components/AuthProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./AuthContext";
import { generateDisplayName } from "@/lib/nameGenerator";
import { User } from "./types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async (id: string) => {
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

      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", authUser.id)
        .single();

      if (!dbUser) {
        await supabase.from("users").insert({
          id: authUser.id,
          display_name: generateDisplayName(authUser.id),
          avatar_url: authUser.user_metadata.avatar_url,
          referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        });
      }

      await hydrateUser(authUser.id);

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

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) setUser(null);
      else hydrateUser(session.user.id);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh: async () => user && hydrateUser(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
