import { TwitterTask } from "@/components/types";

export const TWITTER_TASKS: TwitterTask[] = [
  {
    id: "follow_main",
    name: "Follow Tessium on X",
    reward: 0.2,
    url: "https://x.com/intent/follow?screen_name=Tessium_io",
  },
  {
    id: "share_on_twitter",
    name: "Share your referral link on X",
    url: "",
    reward: 1.0,
    isShareQuest: true,
  },
  {
    id: "share_refcode",
    name: "Share Referral Code",
    reward: 0.2,
    url: "https://x.com/intent/follow?screen_name=Tessium_io",
  },
  {
    id: "join_telegram",
    name: "Join Telegram Community",
    reward: 0.3,
    url: "https://t.me/tessium_io",
  },
  {
    id: "join_discord",
    name: "Join Discord Server",
    reward: 0.15,
    url: "https://discord.com/invite/7M8qjGA4GK",
  },
  {
    id: "youtube_subscribe",
    name: "Subscribe to YouTube Channel",
    reward: 0.1,
    url: "https://www.youtube.com/@tessium_io?si=0dg1zrShUIzl22r2&sub_confirmation=1",
  },
  {
    id: "tiktok_follow",
    name: "Follow Tessium on TikTok",
    reward: 0.1,
    url: "https://www.tiktok.com/@tessium_io",
  },
];

export const TWITTER_CONNECT_REWARD = 0.5;
export const REFERRAL_BONUS = 0.5;
export const BASE_RATE = 0.1;
