const avatarPalette = [
  "#8B5CF6",
  "#F97316",
  "#14B8A6",
  "#0EA5E9",
  "#F87171",
  "#F59E0B",
  "#10B981",
  "#6366F1",
];

export const getRandomAvatarColor = () => {
  const index = Math.floor(Math.random() * avatarPalette.length);
  return avatarPalette[index];
};
