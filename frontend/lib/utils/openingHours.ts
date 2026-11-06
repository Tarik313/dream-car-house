/**
 * Utility to parse showroom opening hours and evaluate live open/closed status in Asia/Dhaka time.
 * Dynamic and responsive to whatever text is configured in the Dashboard.
 */

export interface ParsedHours {
  isOpen: boolean;
  displayHours: string;
  fullText: string;
  isFridayClosed: boolean;
  openMinutes: number;
  closeMinutes: number;
}

export function parseShowroomHours(hoursText?: string | null): ParsedHours {
  const defaultText = "Saturday – Thursday: 10:00 AM – 10:00 PM (Friday Closed)";
  const raw = (hoursText && hoursText.trim().length > 0 ? hoursText.trim() : defaultText);

  // Check if Friday is explicitly marked as closed
  const isFridayClosed = /fri(day)?\s*closed/i.test(raw);

  // Parse time ranges like "10:00 AM – 10:00 PM", "10:00 AM - 9:00 PM", or "10 AM - 10 PM"
  const timeMatch = raw.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[-–—to]+\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i
  );

  let openMinutes = 10 * 60; // 10:00 AM
  let closeMinutes = 22 * 60; // 10:00 PM (22:00)
  let displayHours = "10:00 AM – 10:00 PM";

  if (timeMatch) {
    let startHour = parseInt(timeMatch[1], 10);
    const startMin = parseInt(timeMatch[2] || "0", 10);
    const startPeriod = timeMatch[3].toUpperCase();

    let endHour = parseInt(timeMatch[4], 10);
    const endMin = parseInt(timeMatch[5] || "0", 10);
    const endPeriod = timeMatch[6].toUpperCase();

    if (startPeriod === "PM" && startHour !== 12) startHour += 12;
    if (startPeriod === "AM" && startHour === 12) startHour = 0;

    if (endPeriod === "PM" && endHour !== 12) endHour += 12;
    if (endPeriod === "AM" && endHour === 12) endHour = 0;

    openMinutes = startHour * 60 + startMin;
    closeMinutes = endHour * 60 + endMin;

    displayHours = `${timeMatch[1]}:${(timeMatch[2] || "00").padStart(2, "0")} ${startPeriod} – ${timeMatch[4]}:${(timeMatch[5] || "00").padStart(2, "0")} ${endPeriod}`;
  }

  // Evaluate current Dhaka time (Asia/Dhaka)
  let isOpen = true;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date());

    const weekday = parts.find((p) => p.type === "weekday")?.value || "";
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const currentMinutes = hour * 60 + minute;

    if (weekday.toLowerCase().startsWith("fri") && isFridayClosed) {
      isOpen = false;
    } else {
      isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }
  } catch {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return {
    isOpen,
    displayHours,
    fullText: raw,
    isFridayClosed,
    openMinutes,
    closeMinutes,
  };
}
