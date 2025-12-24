"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  Check,
  Copy,
  Trophy,
  Twitter,
  Users,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  BASE_RATE,
  REFERRAL_BONUS,
  TWITTER_CONNECT_REWARD,
  TWITTER_TASKS,
} from "@/lib/heroUtils";
import { ShootingStar, TwitterTask, User } from "./types";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [referralLeaderboard, setReferralLeaderboard] = useState<User[]>([]);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "quests">(
    "leaderboard"
  );
  const [activeLeaderboard, setActiveLeaderboard] = useState<
    "points" | "referrals"
  >("points");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const errorDesc = urlParams.get("error_description");

      if (errorDesc) {
        console.error("OAuth error:", errorDesc);
        alert(`Twitter connect failed: ${errorDesc}`);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      }

      if (code) {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) {
            console.log("Session after callback:", session);
            await loadUserData(session.user.id);
            const twitterIdentity = session.user.identities?.find(
              (id) => id.provider === "twitter"
            );
            if (twitterIdentity && !user?.twitter_connected) {
              const twitterData = twitterIdentity.identity_data;
              const updatedBaseRate =
                user?.base_rate + TWITTER_CONNECT_REWARD ||
                BASE_RATE + TWITTER_CONNECT_REWARD;
              await supabase
                .from("users")
                .update({
                  twitter_connected: true,
                  base_rate: updatedBaseRate,
                  twitter_username: twitterData?.user_name,
                  twitter_avatar: twitterData?.profile_image_url,
                })
                .eq("id", session.user.id);

              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      twitter_connected: true,
                      base_rate: updatedBaseRate,
                    }
                  : null
              );
            }
          }
        } catch (error) {
          console.error("Callback processing error:", error);
          alert("Failed to process Twitter connect. Please try again.");
        } finally {
          // Clear params from URL to prevent loops
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    };

    handleOAuthCallback();

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUserData(session.user.id);
          const twitterIdentity = session.user.identities?.find(
            (identity) => identity.provider === "twitter"
          );

          if (twitterIdentity && user && !user.twitter_connected) {
            const twitterData = twitterIdentity.identity_data;
            const updatedBaseRate = user.base_rate + TWITTER_CONNECT_REWARD;

            await supabase
              .from("users")
              .update({
                twitter_connected: true,
                base_rate: updatedBaseRate,
                twitter_username: twitterData?.user_name,
                twitter_avatar: twitterData?.profile_image_url,
              })
              .eq("id", user.id);

            setUser({
              ...user,
              twitter_connected: true,
              base_rate: updatedBaseRate,
            });
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const handleAuthenticatedUser = async (authUser: SupabaseUser) => {
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (existingUser) {
          setUser(existingUser);
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const referralCode = urlParams.get("ref");

          const newUser = {
            id: authUser.id,
            email: authUser.email!,
            name:
              authUser.user_metadata?.full_name ||
              authUser.email!.split("@")[0],
            avatar_url: authUser.user_metadata?.avatar_url,
            points: 0,
            base_rate: BASE_RATE,
            twitter_connected: false,
            tasks_completed: [],
            referral_code: generateReferralCode(),
            referral_count: 0,
            referred_by: referralCode || null,
            created_at: new Date().toISOString(),
          };

          const { data: insertedUser } = await supabase
            .from("users")
            .insert([newUser])
            .select()
            .single();
          if (referralCode && insertedUser) {
            console.log("Rewarding referrer with code:", referralCode);
            await rewardReferrer(referralCode);
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }

          setUser(insertedUser || (newUser as User));
        }

        setShowModal(false);
      } catch (error) {
        console.error("Error handling authenticated user:", error);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await handleAuthenticatedUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        } else if (event === "USER_UPDATED" && session?.user) {
          const twitterIdentity = session.user.identities?.find(
            (identity) => identity.provider === "twitter"
          );

          if (twitterIdentity && user && !user.twitter_connected) {
            const twitterData = twitterIdentity.identity_data;
            const updatedBaseRate = user.base_rate + TWITTER_CONNECT_REWARD;

            await supabase
              .from("users")
              .update({
                twitter_connected: true,
                base_rate: updatedBaseRate,
                twitter_username: twitterData?.user_name,
                twitter_avatar: twitterData?.profile_image_url,
              })
              .eq("id", user.id);

            setUser({
              ...user,
              twitter_connected: true,
              base_rate: updatedBaseRate,
            });
          }
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [user]);

  const loadUserData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}${window.location.search}`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Failed to sign in. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut();
  //   setUser(null);
  // };

  // useEffect(() => {
  //   if (!user?.id) return;

  //   const interval = setInterval(async () => {

  //     setUser((prev) => {
  //       if (!prev) return null;

  //       const newPoints = prev.points + prev.base_rate;

  //       (async () => {
  //         try {
  //           await supabase
  //             .from("users")
  //             .update({ points: newPoints })
  //             .eq("id", prev.id);
  //         } catch (error) {
  //           console.error("Error updating points:", error);
  //         }
  //       })();

  //       return { ...prev, points: newPoints };
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [user?.id]);

  const points = user?.points;
  const baseRate = user?.base_rate;

  useEffect(() => {
    if (points == null || baseRate == null) return;

    const start = Date.now();
    const basePoints = points;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setDisplayPoints(basePoints + elapsed * baseRate);
    }, 100);

    return () => clearInterval(interval);
  }, [points, baseRate]);

  useEffect(() => {
    if (!user) return;

    const loadLeaderboard = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .order("points", { ascending: false });

        console.log(data);

        if (data) {
          setLeaderboard(data);

          // Compute referral counts
          const referralCounts = new Map<string, number>();
          data.forEach((u) => {
            if (u.referred_by) {
              const count = referralCounts.get(u.referred_by) || 0;
              referralCounts.set(u.referred_by, count + 1);
            }
          });
          console.log("Referral counts:", referralCounts);

          // Create sorted referral leaderboard
          const referralLB: User[] = data
            .map((u) => ({
              ...u,
              referral_count: referralCounts.get(u.referral_code) || 0,
            }))
            .sort((a, b) => b.referral_count - a.referral_count);

          setReferralLeaderboard(referralLB);

          if (activeLeaderboard === "points") {
            const position = data.findIndex((u) => u.id === user?.id);
            setUserPosition(position !== -1 ? position + 1 : null);
          } else if (activeLeaderboard === "referrals") {
            const position = referralLB.findIndex((u) => u.id === user?.id);
            setUserPosition(position !== -1 ? position + 1 : null);
          }
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      }
    };

    loadLeaderboard();

    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    const interval = setInterval(loadLeaderboard, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [user?.id, user, activeLeaderboard]);

  const handleTwitterConnect = async () => {
    if (!user || user.twitter_connected) return;

    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error("Twitter OAuth error:", error);
        alert(
          `Failed to connect Twitter: ${error.message || "Please try again."}`
        );
      }
    } catch (error) {
      console.error("Error connecting Twitter:", error);
      alert(
        `Failed to connect Twitter: ${error.message || "Please try again."}`
      );
    }
  };

  const handleTaskClick = async (task: TwitterTask) => {
    if (!user) return;

    const completedTasks = Array.isArray(user.tasks_completed)
      ? user.tasks_completed
      : [];

    if (completedTasks.includes(task.id)) return;

    try {
      const popup = window.open(task.url, "_blank", "width=600,height=700");
      const updatedTasksCompleted = [...completedTasks, task.id];
      const updatedBaseRate = user.base_rate + task.reward;

      setUser((prev) =>
        prev
          ? {
              ...prev,
              tasks_completed: updatedTasksCompleted,
              base_rate: updatedBaseRate,
            }
          : prev
      );

      console.log(
        "Local update applied. Updated tasks:",
        updatedTasksCompleted
      );

      supabase
        .rpc("complete_task", {
          p_user_id: user.id,
          p_task_id: task.id,
          p_reward: task.reward,
        })
        .then(
          ({ data, error }) => {
            if (error) {
              console.error("Background Supabase RPC error:", error);
              console.error("Error details:", error?.message || error);
              setTimeout(() => {
                supabase
                  .rpc("complete_task", {
                    p_user_id: user.id,
                    p_task_id: task.id,
                    p_reward: task.reward,
                  })
                  .then(
                    ({ data: retryData, error: retryError }) => {
                      if (retryError) {
                        console.error("Retry failed:", retryError);
                      } else {
                        console.log("Retry success:", retryData);

                        loadUserData(user.id);
                      }
                    },
                    (retryRejectErr) => {
                      console.error("Retry rejected:", retryRejectErr);
                    }
                  );
              }, 2000);
            } else {
              console.log("Background Supabase RPC success:", data);
              loadUserData(user.id);
            }
          },
          (rejectErr) => {
            console.error("Background Supabase rejection error:", rejectErr);
          }
        );
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const rewardReferrer = async (referralCode: string) => {
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
            // points: referrer.points + REFERRAL_BONUS,
            base_rate: referrer.base_rate + REFERRAL_BONUS * 0.1,
            referral_count: referrer.referral_count + 1,
          })
          .eq("id", referrer.id);
      }
    } catch (error) {
      console.error("Error rewarding referrer:", error);
      alert(`Failed to reward referrer: ${error.message}`);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll functions
  const scrollToFeatures = () => {
    const featuresElement = document.getElementById("features");
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToWaitlist = () => {
    const waitlistElement = document.getElementById("waitlist");
    if (waitlistElement) {
      waitlistElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }

      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className={`relative md:min-h-screen flex items-center justify-center px-6 ${
        !user && "py-24"
      } overflow-hidden`}
    >
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"
      />

      {/* Particle background */}
      <div className="absolute inset-0 -z-10">
        <ShootingStarsBackground />
      </div>

      {/* Background elements */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Mobile background images */}
      {/* <div className="absolute inset-0 -z-10 md:hidden opacity-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <FloatingImages isMobile={true} />
        </div>
      </div> */}
      {!user && (
        <div className="max-w-7xl mx-auto w-full h-[450px] md:h-auto flex flex-col md:block items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">
              Onboard, Evolve & <span className="text-accent">Earn </span>
              in the Web3 Ecosystem
            </h1>
          </motion.div>
          <Button
            onClick={() => setShowModal(true)}
            variant="default"
            className="px-10 bg-accent flex items-center mx-auto"
          >
            Join The Waitlist
          </Button>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-background/80 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Continue with
                  </h2>
                </div>

                <Button
                  variant="default"
                  onClick={handleGoogleSignIn}
                  className="px-8 py-2 bg-accent flex items-center justify-center mx-auto"
                >
                  <img
                    src="/google-icon.svg"
                    alt="Google Logo"
                    className="w-5 h-5"
                  />
                  Connect with Google
                </Button>
                <p className="text-gray-600 text-sm text-center mt-4">
                  Sign in to secure your spot
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="max-w-7xl mx-auto md:px-7 px-0 w-full md:flex gap-12">
          <div className="md:w-1/2 flex flex-col items-center justify-center mt-28 md:mt-0">
            <h1 className="md:text-5xl text-4xl font-bold">
              {displayPoints.toFixed(2)} points
            </h1>
            <p className="text-center mt-2">
              {user.base_rate.toFixed(2)} pts/sec
            </p>
            <p className="md:px-24 px-4 text-center my-7">
              You're #{userPosition?.toLocaleString() || "..."} on the waitlist
              for Tessium. Invite others and connect your X to get priority
              access.
            </p>

            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl md:p-6 p-3 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users size={28} className="text-purple-400" />
                Invite Friends
              </h2>

              <p className="text-gray-300 mb-4 text-sm">
                Share your unique link. Each friend who joins gives you{" "}
                <span className="font-bold text-green-400">
                  +{REFERRAL_BONUS} points
                </span>{" "}
                instantly!
              </p>

              <div className="relative bg-black bg-opacity-40 rounded-lg md:p-6 p-3 border border-gray-700 overflow-hidden">
                {/* Referral Link - allow it to flow under the button */}
                <div className="md:text-sm text-xs font-mono text-white break-all md:pr-32">
                  {window.location.origin}?ref={user.referral_code}
                </div>

                {/* Button positioned absolutely inside the div */}
                <button
                  onClick={copyReferralLink}
                  className="md:text-base text-sm absolute bottom-2 right-2 top-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 md:rounded-md rounded-sm font-semibold transition-all flex items-center gap-2 shadow-lg transform hover:scale-105 z-10"
                >
                  {copied ? (
                    <>
                      <Check size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {!user.twitter_connected ? (
              <button
                onClick={handleTwitterConnect}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-semibold transition-all mb-6 mt-7 mx-20 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
              >
                <Twitter size={24} />
                Connect X Account
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  +{TWITTER_CONNECT_REWARD}/sec
                </span>
              </button>
            ) : (
              <div className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-semibold transition-all mb-6 mt-7 mx-20 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105">
                X Connected with {user.twitter_username}
              </div>
            )}
          </div>
          <div className="md:w-1/2 mt-7 md:mt-0">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl md:p-6 p-3 shadow-xl w-full md:h-[500px] h-[300px]">
              {activeTab === "leaderboard" && (
                <div className="w-full h-full overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>Leaderboard</div>
                    <div className="flex items-center gap-2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700 text-sm">
                      <button
                        onClick={() => setActiveLeaderboard("points")}
                        className={`px-4 py-1 rounded-full ${
                          activeLeaderboard === "points"
                            ? "bg-white text-black"
                            : "text-white"
                        }`}
                      >
                        Points
                      </button>
                      <button
                        onClick={() => setActiveLeaderboard("referrals")}
                        className={`px-4 py-1 rounded-full ${
                          activeLeaderboard === "referrals"
                            ? "bg-white text-black"
                            : "text-white"
                        }`}
                      >
                        Referrals
                      </button>
                    </div>
                  </div>

                  <div className="p-2 mt-4">
                    {activeLeaderboard === "points" && (
                      <div className="space-y-2">
                        {leaderboard.slice(0, 15).map((u, index) => (
                          <div
                            key={u.id}
                            className={`flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                              u.id === user.id
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105"
                                : "bg-white bg-opacity-5 hover:bg-opacity-10"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`text-sm font-bold w-4 ${
                                  index === 0
                                    ? "text-yellow-400"
                                    : index === 1
                                    ? "text-gray-300"
                                    : index === 2
                                    ? "text-orange-400"
                                    : "text-gray-400"
                                }`}
                              >
                                #{index + 1}
                              </div>

                              {u.avatar_url && (
                                <img
                                  src={u.avatar_url}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full border-2 border-white border-opacity-20"
                                />
                              )}

                              <div>
                                <div className="font-semibold md:text-lg text-sm">
                                  {u.name}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold">
                                {u.points.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeLeaderboard === "referrals" && (
                      <div className="space-y-2">
                        {referralLeaderboard.slice(0, 15).map((u, index) => (
                          <div
                            key={u.id}
                            className={`flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                              u.id === user.id
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105"
                                : "bg-white bg-opacity-5 hover:bg-opacity-10"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`text-sm font-bold w-4 ${
                                  index === 0
                                    ? "text-yellow-400"
                                    : index === 1
                                    ? "text-gray-300"
                                    : index === 2
                                    ? "text-orange-400"
                                    : "text-gray-400"
                                }`}
                              >
                                #{index + 1}
                              </div>

                              {u.avatar_url && (
                                <img
                                  src={u.avatar_url}
                                  alt={u.name}
                                  className="w-7 h-7 rounded-full border-2 border-white border-opacity-20"
                                />
                              )}

                              <div>
                                <div className="font-semibold md:text-lg text-sm">
                                  {u.name}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold">
                                {u.referral_count}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "quests" && (
                <div className="w-full h-full overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">Quests</h2>
                  <div className="flex flex-col gap-4">
                    {TWITTER_TASKS.map((task) => {
                      const isCompleted =
                        user?.tasks_completed?.includes(task.id) ?? false;

                      return (
                        <button
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          disabled={isCompleted || !user}
                          className={`w-full md:text-base text-sm text-left text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-between shadow-lg transform hover:scale-105 ${
                            isCompleted
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700"
                          }`}
                        >
                          <span>{task.name}</span>
                          {isCompleted ? (
                            <Check size={20} className="text-xs text-white" />
                          ) : (
                            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                              +{task.reward}/sec
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700 text-sm">
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`px-4 py-1 rounded-full ${
                    activeTab === "leaderboard"
                      ? "bg-white text-black"
                      : " text-white"
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab("quests")}
                  className={`px-4 py-1 rounded-full ${
                    activeTab === "quests"
                      ? "bg-white text-black"
                      : " text-white"
                  }`}
                >
                  Quests
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Floating Web3 images component
// const FloatingImages = ({ isMobile }: { isMobile: boolean }) => {
//   return (
//     <div
//       className={`relative flex flex-row min-h-screen justify-center items-center ${
//         isMobile ? "h-full w-full" : "h-[500px] w-full"
//       }`}
//     >
//       <motion.div
//         className="absolute"
//         style={{
//           top: "30%",
//           right: "15%",
//           zIndex: 2,
//         }}
//         animate={{
//           y: [0, 20, 0],
//         }}
//         transition={{
//           duration: 5,
//           repeat: Number.POSITIVE_INFINITY,
//           repeatType: "reverse",
//           delay: 0.5,
//         }}
//       >
//         <HoverableImage
//           src="/logolight.PNG"
//           alt="Crypto Wallet"
//           width={400}
//           height={400}
//         />
//       </motion.div>
//     </div>
//   );
// };

// Hoverable image component with transparent background
// const HoverableImage = ({
//   src,
//   alt,
//   width,
//   height,
// }: {
//   src: string;
//   alt: string;
//   width: number;
//   height: number;
// }) => {
//   return (
//     <motion.div
//       className="relative"
//       whileHover={{
//         scale: 1.1,
//         filter: "drop-shadow(0 0 15px rgba(120, 120, 255, 0.6))",
//       }}
//       transition={{ duration: 0.3 }}
//     >
//       <img
//         src={src || "/placeholder.svg"}
//         alt={alt}
//         width={width}
//         height={height}
//         className="object-contain"
//       />
//     </motion.div>
//   );
// };

// Shooting stars background component
const ShootingStarsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    // Create stars
    // const stars: Star[] = []
    const shootingStars: ShootingStar[] = [];
    const maxShootingStars = 15;

    // Create a shooting star
    const createShootingStar = (): ShootingStar => {
      // Start from left side with random angle
      const angle = (Math.random() * Math.PI) / 4 - Math.PI / 8;
      return {
        x: Math.random() * canvas.width * 0.3,
        y: Math.random() * canvas.height * 0.5,
        length: Math.floor(Math.random() * 80) + 50,
        speed: Math.random() * 2 + 3, // Reduced from (8 + 10) to (3 + 4)
        size: Math.random() * 1.5 + 0.5, // Slightly reduced size
        color: `rgba(255, 255, 255, 0.8)`, // Reduced opacity from 1 to 0.8
        trail: [],
        opacity: 0.5, // Reduced from 1 to 0.7
        active: true,
      };
    };

    // Initialize shooting stars with staggered start times
    for (let i = 0; i < maxShootingStars; i++) {
      const star = createShootingStar();
      star.active = false;
      setTimeout(() => {
        star.active = true;
      }, Math.random() * 15000); // Stagger start times
      shootingStars.push(star);
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw shooting stars
      shootingStars.forEach((star) => {
        if (!star.active) return;

        // Move the star
        star.x += star.speed;
        star.y += star.speed * 0.3;

        // Store position for trail
        star.trail.unshift({ x: star.x, y: star.y });

        // Limit trail length
        if (star.trail.length > star.length) {
          star.trail.pop();
        }

        // Draw trail
        if (star.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);

          // Create gradient for trail
          const gradient = ctx.createLinearGradient(
            star.trail[0].x,
            star.trail[0].y,
            star.trail[star.trail.length - 1].x,
            star.trail[star.trail.length - 1].y
          );
          gradient.addColorStop(
            0,
            `rgba(255, 255, 255, ${star.opacity * 0.8})`
          ); // Reduced brightness
          gradient.addColorStop(
            0.3,
            `rgba(155, 176, 255, ${star.opacity * 0.6})`
          ); // Reduced brightness
          gradient.addColorStop(1, `rgba(121, 176, 255, 0)`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.size;

          // Draw smooth curve through trail points
          for (let i = 1; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y);
          }

          ctx.stroke();

          // Draw star head
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.9})`; // Reduced brightness
          ctx.fill();
        }

        // Reset if off screen
        if (star.x > canvas.width || star.y > canvas.height) {
          const newStar = createShootingStar();
          Object.assign(star, newStar);
          star.active = false;
          setTimeout(() => {
            star.active = true;
          }, Math.random() * 3000);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default Hero;
