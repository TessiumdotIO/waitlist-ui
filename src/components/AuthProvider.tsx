"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as AppUser } from "./types";
import { AuthContext } from "./AuthContext";
import { generateDisplayName } from "@/lib/nameGenerator";
import { BASE_RATE, REFERRAL_BONUS } from "@/lib/heroUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Move loadUserData outside useEffect so we can expose it
  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.warn("User row missing, signing out");
        await supabase.auth.signOut();
        setUser(null);
        return null;
      }

      setUser(data);
      return data;
    } catch (error) {
      console.error("AuthProvider: failed to load user:", error);
      setUser(null);
      return null;
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("AuthProvider: checkSession error", error);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const referralCode = new URLSearchParams(window.location.search).get(
            "ref"
          );

          if (referralCode) {
            await supabase.rpc("handle_referral", {
              referral_code: referralCode,
              new_user_id: session.user.id,
            });
          }

          await loadUserData(session.user.id);
          setLoading(false);
          return;
        }

        if (
          (event === "USER_UPDATED" || event === "TOKEN_REFRESHED") &&
          session?.user
        ) {
          await loadUserData(session.user.id);
          return;
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
