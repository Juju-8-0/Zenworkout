export const affirmations = [
  "Every workout brings you closer to your strongest self. You've got this!",
  "Your body can do it. It's your mind you need to convince.",
  "Progress, not perfection. Every step counts.",
  "You are stronger than your excuses.",
  "The only bad workout is the one that didn't happen.",
  "Believe in yourself and push your limits.",
  "Your future self will thank you for working out today.",
  "Champions train, losers complain. You're a champion!",
  "Success starts with self-discipline. You've got this!",
  "Every rep, every set, every minute - you're investing in yourself.",
  "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't wish for it, work for it.",
  "Your only limit is your mind.",
  "Sweat is just fat crying.",
  "Make yourself proud.",
  "The body achieves what the mind believes.",
  "You're not just changing your body, you're changing your life.",
  "Every workout is a victory.",
  "Consistency is key. Keep showing up for yourself.",
];

export function getRandomAffirmation(): string {
  const randomIndex = Math.floor(Math.random() * affirmations.length);
  return affirmations[randomIndex];
}

export function getAffirmationByDate(date: Date): string {
  // Use date as seed for consistent daily affirmation
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % affirmations.length;
  return affirmations[index];
}
