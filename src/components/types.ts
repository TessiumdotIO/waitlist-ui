export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  points: number;
  points_rate: number;
  twitter_connected: boolean;
  twitter_username?: string;
  twitter_avatar?: string;
  tasks_completed: string[];
  referral_code: string;
  referral_count: number;
  referred_by?: string;
  created_at: string;
  display_name?: string;
  last_update?: string;
}

export interface TwitterTask {
  id: string;
  name: string;
  type: string;
  url?: string;
  isShareQuest?: boolean;
  reward: number; // pts/sec increase
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: number;
}

export interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  size: number;
  color: string;
  trail: Array<{ x: number; y: number }>;
  opacity: number;
  active: boolean;
}
