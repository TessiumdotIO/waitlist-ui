// AuthProvider.tsx (updated to set display_name on create)
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as AppUser } from "./types";
import { AuthContext } from "./AuthContext";
import {
  BASE_RATE,
  REFERRAL_BONUS,
  TWITTER_CONNECT_REWARD,
} from "@/lib/heroUtils";
import { generateDisplayName } from "@/lib/nameGenerator";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserData = async (userId: string): Promise<boolean> => {
    try {
      const { data: dbUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (!dbUser) {
        // Create new user
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        const displayName = generateDisplayName(userId);
        const newUser = {
          id: userId,
          points: 0,
          base_rate: BASE_RATE,
          twitter_connected: false,
          tasks_completed: [],
          referral_code: Math.random().toString(36).slice(2, 10).toUpperCase(),
          avatar_url: authUser?.user_metadata?.avatar_url || "",
          referral_count: 0,
          last_update: new Date().toISOString(),
          created_at: new Date().toISOString(),
          display_name: displayName,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from("users")
          .insert(newUser)
          .select()
          .single();

        if (insertErr) throw insertErr;

        setUser(inserted);
        return true;
      }

      // Calculate accumulated points if last_update exists
      let points = dbUser.points;
      if (dbUser.last_update) {
        const lastUpdate = Date.parse(dbUser.last_update);
        if (!isNaN(lastUpdate)) {
          const elapsed = (Date.now() - lastUpdate) / 1000;
          points += elapsed * dbUser.base_rate;
        }
      }

      // Update DB with new points and current timestamp
      const now = new Date().toISOString();
      const { error: updateErr } = await supabase
        .from("users")
        .update({ points, last_update: now })
        .eq("id", userId);

      if (updateErr) throw updateErr;

      // Check for Twitter connection
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const hasTwitter = authUser?.identities?.some(
        (i) => i.provider === "twitter"
      );
      let twitterUsername = dbUser.twitter_username;
      let baseRate = dbUser.base_rate;
      let twitterConnected = dbUser.twitter_connected;

      if (hasTwitter && !dbUser.twitter_connected) {
        const twitterIdentity = authUser?.identities?.find(
          (i) => i.provider === "twitter"
        );
        twitterUsername = twitterIdentity?.identity_data?.user_name || "";
        baseRate += TWITTER_CONNECT_REWARD;
        twitterConnected = true;

        const { error: twitterUpdateErr } = await supabase
          .from("users")
          .update({
            twitter_connected: true,
            twitter_username: twitterUsername,
            base_rate: baseRate,
          })
          .eq("id", userId);

        if (twitterUpdateErr) throw twitterUpdateErr;
      }

      setUser({
        ...dbUser,
        points,
        base_rate: baseRate,
        twitter_connected: twitterConnected,
        twitter_username: twitterUsername,
      });
      return true;
    } catch (err) {
      console.error("loadUserData error:", err);
      return false;
    }
  };

  const refreshUser = async () => {
    if (user?.id) await loadUserData(user.id);
  };

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const success = await loadUserData(session.user.id);

        if (success) {
          const referralCode = new URLSearchParams(window.location.search).get(
            "ref"
          );
          const hasApplied = localStorage.getItem(
            `referral_applied_${session.user.id}`
          );

          if (referralCode && !hasApplied) {
            const { data, error } = await supabase.rpc("handle_referral", {
              p_referral_code: referralCode,
              p_new_user_id: session.user.id,
            });

            if (!error && data) {
              localStorage.setItem(
                `referral_applied_${session.user.id}`,
                "true"
              );
              await loadUserData(session.user.id);
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (
          event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "TOKEN_REFRESHED"
        ) {
          if (session?.user) await loadUserData(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
