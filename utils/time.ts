export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  if (diffInSeconds < 0) {
    const absDiffInSeconds = Math.abs(diffInSeconds);
    const absDiffInMinutes = Math.abs(diffInMinutes);
    const absDiffInHours = Math.abs(diffInHours);
    const absDiffInDays = Math.abs(diffInDays);

    if (absDiffInDays >= 1) {
      return `${Math.round(absDiffInDays)} day(s) ago`;
    }
    if (absDiffInHours >= 1) {
      return `${Math.round(absDiffInHours)} hour(s) ago`;
    }
    if (absDiffInMinutes >= 1) {
      return `${Math.round(absDiffInMinutes)} minute(s) ago`;
    }
    return "just now";
  }

  if (Math.abs(diffInDays) >= 1) {
    return `in ${Math.round(diffInDays)} day(s)`;
  }
  if (Math.abs(diffInHours) >= 1) {
    return `in ${Math.round(diffInHours)} hour(s)`;
  }
  if (Math.abs(diffInMinutes) >= 1) {
    return `in ${Math.round(diffInMinutes)} minute(s)`;
  }
  return "now";
}
