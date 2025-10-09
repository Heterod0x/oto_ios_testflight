export const formatDuration = (seconds: number): string => {
  const totalSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
