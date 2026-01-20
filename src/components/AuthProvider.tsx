"use client";

import { ReactNode, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./AuthContext"; // ✅ import the single AuthContext
import { User } from "./types";
import { generateDisplayName } from "@/lib/nameGenerator";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

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

      if (authUser) {
        const { data: userData } = await supabase.auth.getUser();

        const connected =
          userData.user?.app_metadata?.provider === "twitter" ||
          userData.user?.identities?.some((i) => i.provider === "twitter");

        setIsTwitterConnected(!!connected);
      }

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
          points_rate: 0.1, // start points/sec
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

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_, session) => {
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
        }
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to changes for the logged-in user's row
    const channel = supabase
      .channel(`user-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.id}`, // only updates for this user
        },
        (payload) => {
          setUser(payload.new as User); // update frontend state immediately
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, user]);

  const refresh = async () => {
    if (user) await hydrateUser(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, refresh, isTwitterConnected }}
    >
      {children}
    </AuthContext.Provider>
  );
};
