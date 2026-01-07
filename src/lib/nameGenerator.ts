const adjectives = [
  "Swift",
  "Cosmic",
  "Mystic",
  "Noble",
  "Silent",
  "Brave",
  "Wild",
  "Fierce",
  "Ancient",
  "Stellar",
  "Thunder",
  "Shadow",
  "Crystal",
  "Golden",
  "Silver",
  "Iron",
  "Phantom",
  "Blazing",
  "Frozen",
  "Electric",
  "Mighty",
  "Divine",
  "Rogue",
  "Epic",
  "Legendary",
  "Cryptic",
  "Radiant",
  "Quantum",
  "Neon",
  "Cyber",
  "Digital",
  "Pixel",
  "Lunar",
  "Solar",
  "Astral",
  "Void",
  "Primal",
];

const nouns = [
  "Wolf",
  "Dragon",
  "Phoenix",
  "Tiger",
  "Eagle",
  "Falcon",
  "Lion",
  "Panther",
  "Bear",
  "Hawk",
  "Viper",
  "Raven",
  "Serpent",
  "Fox",
  "Jaguar",
  "Shark",
  "Warrior",
  "Knight",
  "Hunter",
  "Ninja",
  "Samurai",
  "Titan",
  "Guardian",
  "Champion",
  "Legend",
  "Hero",
  "Sage",
  "Wizard",
  "Ranger",
  "Striker",
  "Voyager",
  "Pioneer",
  "Explorer",
  "Sentinel",
  "Crusader",
  "Wanderer",
];

/**
 * Alternative: Generate random name without consistency
 */
export const generateDisplayName = (userId: string): string => {
  // Create a simple hash from the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to select adjective and noun
  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 8) % nouns.length;

  // Generate a number based on the hash (0-999)
  const number = Math.abs(hash % 1000);

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
};
