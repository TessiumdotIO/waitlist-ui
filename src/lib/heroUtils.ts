import { TwitterTask } from "@/components/types";

export const TWITTER_TASKS: TwitterTask[] = [
  {
    id: "follow_main",
    name: "Follow Tessium on X",
    url: "https://x.com/intent/follow?screen_name=Tessium_io",
    isShareQuest: false,
    type: "twitter_follow",
  },
  {
    id: "share_on_twitter",
    name: "Share your referral link on X",
    url: "",
    isShareQuest: true,
    type: "twitter_share",
  },
  {
    id: "join_telegram",
    name: "Join Telegram Community",
    url: "https://t.me/tessium_io",
    isShareQuest: false,
    type: "telegram",
  },
  {
    id: "join_discord",
    name: "Join Discord Server",
    url: "https://discord.com/invite/7M8qjGA4GK",
    isShareQuest: false,
    type: "discord",
  },
  {
    id: "youtube_subscribe",
    name: "Subscribe to YouTube Channel",
    url: "https://www.youtube.com/@tessium_io?si=0dg1zrShUIzl22r2&sub_confirmation=1",
    isShareQuest: false,
    type: "youtube",
  },
  {
    id: "tiktok_follow",
    name: "Follow Tessium on TikTok",
    url: "https://www.tiktok.com/@tessium_io",
    isShareQuest: false,
    type: "tiktok",
  },
];

export const TWITTER_CONNECT_REWARD = 0.5;
export const REFERRAL_BONUS = 0.5;
export const BASE_RATE = 0.1;
