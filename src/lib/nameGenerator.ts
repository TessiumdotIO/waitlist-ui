const adjectives = [
  "Swift",
  "Bright",
  "Bold",
  "Cosmic",
  "Digital",
  "Electric",
  "Stellar",
  "Quantum",
  "Cyber",
  "Neon",
  "Turbo",
  "Ultra",
  "Mega",
  "Super",
  "Hyper",
];

const nouns = [
  "Phoenix",
  "Dragon",
  "Tiger",
  "Eagle",
  "Falcon",
  "Wolf",
  "Lion",
  "Panther",
  "Hawk",
  "Viper",
  "Ninja",
  "Samurai",
  "Warrior",
  "Knight",
];

export function generateDisplayName(userId: string): string {
  // Use userId as seed for consistent generation
  const hash = userId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const adjIndex = hash % adjectives.length;
  const nounIndex = (hash * 7) % nouns.length;
  const num = (hash % 9000) + 1000;

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
}
