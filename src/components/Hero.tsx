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
import { ShootingStar, TwitterTask, User } from "./types";
import { usePointsTicker } from "@/hooks/usePointsTicker";
import { useAuth } from "./AuthContext";

const TWITTER_TASKS: TwitterTask[] = [
  {
    id: "follow_main",
    name: "Follow Tessium on X",
    url: "https://x.com/intent/follow?screen_name=Tessium_io",
    isShareQuest: false,
    type: "twitter_follow",
    reward: 0.2,
  },
  {
    id: "share_on_twitter",
    name: "Share your referral link on X",
    url: "",
    isShareQuest: true,
    type: "twitter_share",
    reward: 0.3,
  },
  {
    id: "join_telegram",
    name: "Join Telegram Community",
    url: "https://t.me/tessium_io",
    isShareQuest: false,
    type: "telegram",
    reward: 0.3,
  },
  {
    id: "join_discord",
    name: "Join Discord Server",
    url: "https://discord.com/invite/7M8qjGA4GK",
    isShareQuest: false,
    type: "discord",
    reward: 0.15,
  },
  {
    id: "youtube_subscribe",
    name: "Subscribe to YouTube Channel",
    url: "https://www.youtube.com/@tessium_io?si=0dg1zrShUIzl22r2&sub_confirmation=1",
    isShareQuest: false,
    type: "youtube",
    reward: 0.1,
  },
  {
    id: "tiktok_follow",
    name: "Follow Tessium on TikTok",
    url: "https://www.tiktok.com/@tessium_io",
    isShareQuest: false,
    type: "tiktok",
    reward: 0.1,
  },
];

const TWITTER_CONNECT_REWARD = 0.5;
const REFERRAL_BONUS = 0.5;

// Skeleton Components
const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-white bg-opacity-5 rounded ${className}`} />
);

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const { user, loading, refresh, isTwitterConnected } = useAuth();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [referralLeaderboard, setReferralLeaderboard] = useState<User[]>([]);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "quests">(
    "leaderboard"
  );
  const [activeLeaderboard, setActiveLeaderboard] = useState<
    "points" | "referrals"
  >("points");

  const displayPoints = usePointsTicker(
    user?.points ?? 0,
    user?.points_rate ?? 0.1
  );

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

  const handleTwitterConnect = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: window.location.href,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Twitter connect error:", err);
      alert("Failed to connect X account");
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadLeaderboard = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("points", { ascending: false });

      if (data) {
        setLeaderboard(data);
        const refLB = [...data].sort(
          (a, b) => b.referral_count - a.referral_count
        );
        setReferralLeaderboard(refLB);

        if (activeLeaderboard === "points") {
          const pos = data.findIndex((u) => u.id === user.id) + 1;
          setUserPosition(pos || null);
        } else {
          const pos = refLB.findIndex((u) => u.id === user.id) + 1;
          setUserPosition(pos || null);
        }
      }
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000);

    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        loadLeaderboard
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [user, activeLeaderboard]);

  const buildTweetUrl = (user: User) => {
    const referralLink = `https://waitlist.tessium.io?ref=${user.referral_code}`;

    const tweetText =
      `The shift is coming 🌊\n\n` +
      `@Tessium_io is building the AI-edutainment layer powering real onboarding.\n\n` +
      `I just joined the limited waitlist and started earning early points.\n\n` +
      `Join here 👉 ${referralLink}`;

    return `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  };

  const handleTaskClick = async (task: TwitterTask) => {
    if (!user) return;
    if (user.tasks_completed.includes(task.id)) return;

    let url = task.url;

    if (task.isShareQuest) {
      url = buildTweetUrl(user);
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=700");
    }

    try {
      await supabase.rpc("complete_task", {
        p_user_id: user.id,
        p_task_id: task.id,
      });

      await refresh();
    } catch (error) {
      console.error("Task completion error:", error);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const pointsWithRank = leaderboard.map((u, idx) => ({
    ...u,
    globalRank: idx + 1,
  }));
  const pointsDisplay = user
    ? pointsWithRank.slice(0, 15).some((u) => u.id === user.id)
      ? pointsWithRank.slice(0, 15)
      : [
          pointsWithRank.find((u) => u.id === user.id)!,
          ...pointsWithRank.slice(0, 14),
        ]
    : pointsWithRank.slice(0, 15);

  const referralsWithRank = referralLeaderboard.map((u, idx) => ({
    ...u,
    globalRank: idx + 1,
  }));
  const referralsDisplay = user
    ? referralsWithRank.slice(0, 15).some((u) => u.id === user.id)
      ? referralsWithRank.slice(0, 15)
      : [
          referralsWithRank.find((u) => u.id === user.id)!,
          ...referralsWithRank.slice(0, 14),
        ]
    : referralsWithRank.slice(0, 15);

  return (
    <section
      ref={heroRef}
      className={`relative md:min-h-screen flex items-center justify-center md:px-6 px-2 ${
        !user && "py-24"
      } overflow-hidden`}
    >
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 rounded-full border-2 border-primary pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"
      />

      <div className="absolute inset-0 -z-10">
        <ShootingStarsBackground />
      </div>

      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {loading ? (
        // Skeleton UI for loading state
        <div className="max-w-7xl mx-auto md:px-7 px-0 w-full md:flex gap-12">
          <div className="md:w-1/2 flex flex-col items-center justify-center mt-28 md:mt-0">
            {/* Points Skeleton */}
            <SkeletonBox className="h-12 w-64 mb-2" />
            <SkeletonBox className="h-6 w-32 mb-7" />
            <SkeletonBox className="h-16 md:w-96 w-80 mb-7" />

            {/* Invite Friends Card Skeleton */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl md:p-6 p-3 shadow-xl w-full max-w-md">
              <SkeletonBox className="h-8 w-48 mb-4" />
              <SkeletonBox className="h-12 w-full mb-4" />
              <div className="relative bg-black bg-opacity-40 rounded-lg md:p-6 p-3 border border-gray-700">
                <SkeletonBox className="h-6 w-full" />
              </div>
            </div>

            {/* Twitter Connect Skeleton */}
            <SkeletonBox className="w-full max-w-md h-14 mt-7 rounded-xl" />
          </div>

          <div className="md:w-1/2 mt-7 md:mt-0">
            <div className="flex sm:hidden w-full items-center my-5 gap-2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700 text-sm">
              <button className="px-4 py-1 rounded-full w-1/2 bg-white text-black">
                Leaderboard
              </button>
              <button className="px-4 py-1 rounded-full w-1/2 text-white">
                Quests
              </button>
            </div>

            {/* Leaderboard Card Skeleton */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl md:p-6 p-3 shadow-xl w-full md:h-[500px] h-[300px] mb-7 md:mb-1">
              <div className="flex items-center justify-between mb-4">
                <SkeletonBox className="h-6 w-32" />
                <div className="flex items-center gap-2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700">
                  <div className="px-4 py-1 rounded-full bg-white text-black text-sm">
                    Points
                  </div>
                  <div className="px-4 py-1 rounded-full text-white text-sm">
                    Referrals
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between md:px-4 px-2 py-2 rounded-xl bg-white bg-opacity-5"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <SkeletonBox className="w-4 h-4" />
                      <SkeletonBox className="w-7 h-7 rounded-full" />
                      <SkeletonBox className="h-5 w-32" />
                    </div>
                    <SkeletonBox className="h-5 w-16" />
                  </div>
                ))}
              </div>

              <div className="sm:flex hidden items-center gap-2 absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700 text-sm">
                <button className="px-4 py-1 rounded-full bg-white text-black">
                  Leaderboard
                </button>
                <button className="px-4 py-1 rounded-full text-white">
                  Quests
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !user ? (
        <div className="max-w-7xl mx-auto w-full h-[450px] md:h-auto flex flex-col md:block items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center">
              Build Real <span className="text-accent">Users, </span>
              Not Just Wallets
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
                  disabled={authLoading}
                  className="px-8 py-2 bg-accent flex items-center justify-center mx-auto gap-2"
                >
                  {!authLoading && (
                    <img
                      src="/google-icon.svg"
                      alt="Google Logo"
                      className="w-5 h-5"
                    />
                  )}
                  {authLoading ? "Connecting..." : "Connect with Google"}
                </Button>
                <p className="text-gray-600 text-sm text-center mt-4">
                  Sign in to secure your spot
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto md:px-7 px-0 w-full md:flex gap-12">
          <div className="md:w-1/2 flex flex-col items-center justify-center mt-28 md:mt-0">
            <h1 className="md:text-5xl text-4xl font-bold">
              {displayPoints.toFixed(2)} points
            </h1>
            <p className="text-center mt-2">
              {user.points_rate.toFixed(2)} pts/sec
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
                  +{REFERRAL_BONUS} pts/sec
                </span>
                !
              </p>

              <div className="relative bg-black bg-opacity-40 rounded-lg md:p-6 p-3 border border-gray-700 overflow-hidden">
                <div className="md:text-sm text-xs font-mono text-white break-all md:pr-32">
                  {window.location.origin}?ref={user.referral_code}
                </div>
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

            {!isTwitterConnected ? (
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
              <div className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold mb-6 mt-7 mx-20 flex items-center justify-center gap-3 shadow-lg">
                <Check size={24} />X Connected{" "}
                {user.twitter_username && `as @${user.twitter_username}`}
              </div>
            )}
          </div>
          <div className="md:w-1/2 mt-7 md:mt-0">
            <div className="flex sm:hidden w-full items-center my-5 gap-2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700 text-sm">
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`px-4 py-1 rounded-full w-1/2 ${
                  activeTab === "leaderboard"
                    ? "bg-white text-black"
                    : " text-white"
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab("quests")}
                className={`px-4 py-1 rounded-full w-1/2 ${
                  activeTab === "quests" ? "bg-white text-black" : " text-white"
                }`}
              >
                Quests
              </button>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl md:p-6 p-3 shadow-xl w-full md:h-[500px] h-[300px] mb-7 md:mb-1">
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
                        {pointsDisplay.map((entry) => {
                          const isUser = entry.id === user?.id;
                          const displayRank = isUser
                            ? userPosition ?? entry.globalRank
                            : entry.globalRank;

                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between md:px-4 px-2 py-2 rounded-xl transition-all ${
                                isUser
                                  ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105"
                                  : "bg-white bg-opacity-5 hover:bg-opacity-10"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`text-sm font-bold w-4 ${
                                    displayRank === 1
                                      ? "text-yellow-400"
                                      : displayRank === 2
                                      ? "text-gray-300"
                                      : displayRank === 3
                                      ? "text-orange-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  #{displayRank}
                                </div>

                                {entry.avatar_url && (
                                  <img
                                    src={entry.avatar_url}
                                    alt={
                                      entry.display_name ||
                                      entry.email ||
                                      "User"
                                    }
                                    className="w-7 h-7 rounded-full border-2 border-white border-opacity-20"
                                  />
                                )}

                                <div>
                                  <div className="font-semibold md:text-lg text-sm">
                                    {entry.display_name}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-bold">
                                  {entry.points.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {activeLeaderboard === "referrals" && (
                      <div className="space-y-2">
                        {referralsDisplay.map((entry) => {
                          const isUser = entry.id === user?.id;
                          const displayRank = isUser
                            ? userPosition ?? entry.globalRank
                            : entry.globalRank;

                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between md:px-4 px-2 py-2 rounded-xl transition-all ${
                                isUser
                                  ? "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg scale-105"
                                  : "bg-white bg-opacity-5 hover:bg-opacity-10"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`text-sm font-bold w-4 ${
                                    displayRank === 1
                                      ? "text-yellow-400"
                                      : displayRank === 2
                                      ? "text-gray-300"
                                      : displayRank === 3
                                      ? "text-orange-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  #{displayRank}
                                </div>

                                {entry.avatar_url && (
                                  <img
                                    src={entry.avatar_url}
                                    alt={
                                      entry.display_name ||
                                      entry.email ||
                                      "User"
                                    }
                                    className="w-7 h-7 rounded-full border-2 border-white border-opacity-20"
                                  />
                                )}

                                <div>
                                  <div className="font-semibold md:text-lg text-sm">
                                    {entry.display_name}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-bold">
                                  {entry.referral_count}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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

              <div className="sm:flex hidden items-center gap-2 absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black bg-opacity-40 rounded-full border border-gray-700 text-sm">
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

const ShootingStarsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    const shootingStars: ShootingStar[] = [];
    const maxShootingStars = 15;

    const createShootingStar = (): ShootingStar => {
      return {
        x: Math.random() * canvas.width * 0.3,
        y: Math.random() * canvas.height * 0.5,
        length: Math.floor(Math.random() * 80) + 50,
        speed: Math.random() * 2 + 3,
        size: Math.random() * 1.5 + 0.5,
        color: `rgba(255, 255, 255, 0.8)`,
        trail: [],
        opacity: 0.5,
        active: true,
      };
    };

    for (let i = 0; i < maxShootingStars; i++) {
      const star = createShootingStar();
      star.active = false;
      setTimeout(() => (star.active = true), Math.random() * 15000);
      shootingStars.push(star);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shootingStars.forEach((star) => {
        if (!star.active) return;

        star.x += star.speed;
        star.y += star.speed * 0.3;

        star.trail.unshift({ x: star.x, y: star.y });
        if (star.trail.length > star.length) star.trail.pop();

        if (star.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);

          const gradient = ctx.createLinearGradient(
            star.trail[0].x,
            star.trail[0].y,
            star.trail[star.trail.length - 1].x,
            star.trail[star.trail.length - 1].y
          );
          gradient.addColorStop(
            0,
            `rgba(255, 255, 255, ${star.opacity * 0.8})`
          );
          gradient.addColorStop(
            0.3,
            `rgba(155, 176, 255, ${star.opacity * 0.6})`
          );
          gradient.addColorStop(1, `rgba(121, 176, 255, 0)`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.size;

          for (let i = 1; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y);
          }
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.9})`;
          ctx.fill();
        }

        if (star.x > canvas.width || star.y > canvas.height) {
          Object.assign(star, createShootingStar());
          star.active = false;
          setTimeout(() => (star.active = true), Math.random() * 3000);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", setCanvasDimensions);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default Hero;
