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
  const [loading, setLoading] = useState(false); // Set to false by default

  // Load user data from Supabase users table
  const loadUserData = async (userId: string): Promise<boolean> => {
    try {
      console.log("🔄 Loading user data for ID:", userId);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("📦 Database response:", { data, error });

      if (error) {
        if (error.code === "PGRST116") {
          // user does not exist — allow creation below
        } else {
          console.error("Error loading user data:", error);
          return false;
        }
      }

      if (data) {
        console.log("User data found, setting user:", data);
        setUser(data);
        return true;
      }

      // attempt to get the current session to extract user metadata (avatar), fallback to empty string
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      const newUser = {
        id: userId,
        points: 0,
        base_rate: 0.1,
        twitter_connected: false,
        tasks_completed: [],
        referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
        avatar_url: currentSession?.user?.user_metadata?.avatar_url || "",
      };

      const { data: insertedUser, error: insertError } = await supabase
        .from("users")
        .insert(newUser)
        .select()
        .single();

      if (insertError) {
        console.error("❌ Failed to create user row:", insertError);
        return false;
      }

      setUser(insertedUser);
      return true;
    } catch (err) {
      console.error("💥 loadUserData exception:", err);
      return false;
    }
  };

  // Refresh user from Supabase
  const refreshUser = async () => {
    if (user?.id) await loadUserData(user.id);
  };

  useEffect(() => {
    let mounted = true;

    // Replace the initSession function in AuthProvider.tsx

    const initSession = async () => {
      try {
        console.log("🔍 Checking session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("📋 Session result:", session ? "Found" : "Not found");

        if (!mounted) return;

        if (session?.user) {
          console.log("✅ Session exists, loading user data...");

          // Get referral code from URL before loading user
          const referralCode = new URLSearchParams(window.location.search).get(
            "ref"
          );
          const hasAppliedReferral = localStorage.getItem(
            `referral_applied_${session.user.id}`
          );

          const success = await loadUserData(session.user.id);
          console.log("📊 User data loaded:", success);

          // Handle referral AFTER user is loaded
          if (success && referralCode && !hasAppliedReferral) {
            console.log("🎁 Applying referral code:", referralCode);

            try {
              const { data, error } = await supabase.rpc("handle_referral", {
                referral_code: referralCode,
                new_user_id: session.user.id,
              });

              if (error) {
                console.error("❌ Referral error:", error);
              } else {
                console.log("✅ Referral applied successfully");
                localStorage.setItem(
                  `referral_applied_${session.user.id}`,
                  "true"
                );

                // Reload user data to get updated values
                await loadUserData(session.user.id);
              }
            } catch (err) {
              console.error("💥 Referral exception:", err);
            }
          }
        } else {
          console.log("❌ No session found, setting user to null");
          setUser(null);
        }
      } catch (err) {
        console.error("❗ Session initialization error:", err);
        setUser(null);
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (
          (event === "SIGNED_IN" ||
            event === "USER_UPDATED" ||
            event === "TOKEN_REFRESHED") &&
          session?.user
        ) {
          await loadUserData(session.user.id);
          return;
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
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
