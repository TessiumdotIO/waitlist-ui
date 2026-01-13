"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as AppUser } from "./types";
import { AuthContext } from "./AuthContext";
import { generateDisplayName } from "@/lib/nameGenerator";
import { BASE_RATE } from "@/lib/heroUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUserData = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (mounted) {
          setUser(data || null);
          setLoading(false); // ADD THIS
        }
      } catch (error) {
        console.error("AuthProvider: failed to load user:", error);
        if (mounted) {
          setUser(null);
          setLoading(false); // ADD THIS
        }
      }
    };

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          // ADD THIS ELSE BLOCK - This is the key fix!
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("AuthProvider: checkSession error", error);
        if (mounted) setLoading(false); // This was already here, keep it
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          try {
            const userId = session.user.id;

            const { data: existing } = await supabase
              .from("users")
              .select("*")
              .eq("id", userId)
              .single();

            if (existing) {
              if (mounted) setUser(existing);
            } else {
              const urlParams = new URLSearchParams(window.location.search);
              const referralCode = urlParams.get("ref");

              const newUser: Partial<AppUser> = {
                id: userId,
                email: session.user.email ?? null,
                name:
                  session.user.user_metadata?.full_name ||
                  session.user.email?.split("@")[0] ||
                  null,
                display_name: generateDisplayName(userId),
                avatar_url: session.user.user_metadata?.avatar_url || null,
                points: 0,
                base_rate: BASE_RATE,
                twitter_connected: false,
                tasks_completed: [],
                referral_code: Math.random()
                  .toString(36)
                  .substring(2, 8)
                  .toUpperCase(),
                referral_count: 0,
                referred_by: referralCode || null,
                created_at: new Date().toISOString(),
              };

              const { data: inserted } = await supabase
                .from("users")
                .insert([newUser])
                .select()
                .single();

              if (referralCode && inserted) {
                try {
                  const { data: referrer } = await supabase
                    .from("users")
                    .select("*")
                    .eq("referral_code", referralCode)
                    .single();

                  if (referrer) {
                    await supabase
                      .from("users")
                      .update({
                        base_rate: (referrer.base_rate || 0) + 0,
                        referral_count: (referrer.referral_count || 0) + 1,
                      })
                      .eq("id", referrer.id);
                  }
                } catch (err) {
                  console.error("AuthProvider: error rewarding referrer", err);
                }
              }

              if (mounted) setUser(inserted || (newUser as AppUser));
            }
          } catch (err) {
            console.error("AuthProvider: error handling SIGNED_IN:", err);
          }
        } else if (event === "SIGNED_OUT") {
          if (mounted) setUser(null);
        } else if (
          (event === "USER_UPDATED" || event === "TOKEN_REFRESHED") &&
          session?.user
        ) {
          await loadUserData(session.user.id);
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
