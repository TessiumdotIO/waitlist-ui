"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as AppUser } from "./types";
import { AuthContext } from "./AuthContext";
import { BASE_RATE, REFERRAL_BONUS } from "@/lib/heroUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from Supabase users table
  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading user data:", error);
      }

      if (data) return setUser(data);

      // Fallback if user row missing
      console.warn("User row missing! Creating fallback user locally.");
      setUser({
        id: userId,
        email: "",
        name: "Anonymous",
        points: 0,
        base_rate: BASE_RATE,
        twitter_connected: false,
        tasks_completed: [],
        referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        referral_count: 0,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("loadUserData exception:", err);
      setUser(null);
    }
  };

  // Refresh user from Supabase
  const refreshUser = async () => {
    if (user?.id) await loadUserData(user.id);
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUserData(session.user.id);

          // Handle referral code on first visit
          const referralCode = new URLSearchParams(window.location.search).get(
            "ref"
          );
          if (referralCode) {
            try {
              await supabase.rpc("handle_referral", {
                referral_code: referralCode,
                new_user_id: session.user.id,
              });
            } catch (err) {
              console.warn("Referral RPC failed:", err);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session initialization error:", err);
        setUser(null);
      } finally {
        if (mounted) setLoading(false); // ALWAYS stop loading
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          (event === "SIGNED_IN" ||
            event === "USER_UPDATED" ||
            event === "TOKEN_REFRESHED") &&
          session?.user
        ) {
          await loadUserData(session.user.id);
          setLoading(false);
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
