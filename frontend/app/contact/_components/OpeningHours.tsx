"use client";

import { useEffect, useState } from "react";

// days: 0 = Sunday … 6 = Saturday. open/close are 24h hours in Dhaka time.
// TODO: confirm with the showroom — these came from the design mock.
const HOURS = [
  { label: "Saturday – Thursday", time: "10:00 AM – 8:00 PM", days: [6, 0, 1, 2, 3, 4], open: 10, close: 20 },
  { label: "Friday", time: "3:00 PM – 8:00 PM", days: [5], open: 15, close: 20 },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function nowInDhaka() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: WEEKDAYS.indexOf(get("weekday")),
    hour: Number(get("hour")) + Number(get("minute")) / 60,
  };
}

export default function OpeningHours() {
  // Computed after mount: the server can't know the visitor's "now", and
  // rendering it during SSR would cause a hydration mismatch.
  const [now, setNow] = useState<{ day: number; hour: number } | null>(null);

  useEffect(() => {
    setNow(nowInDhaka());
  }, []);

  const today = now ? HOURS.find((h) => h.days.includes(now.day)) : undefined;
  const isOpen = !!(now && today && now.hour >= today.open && now.hour < today.close);

  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-[0.08em] mb-3">Opening Hours</p>
      <div className="flex flex-col">
        {HOURS.map((h) => {
          const highlight = h === today;
          return (
            <div
              key={h.label}
              className="flex justify-between gap-4 py-2.5 border-b border-line text-sm"
            >
              <span className={highlight ? "text-ink" : "text-muted"}>{h.label}</span>
              <span className={`text-right whitespace-nowrap ${highlight ? "text-ink" : "text-muted"}`}>
                {h.time}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[13px] text-muted mt-3 flex items-center gap-2 min-h-5">
        {now && (
          <>
            <span
              className={`w-2 h-2 rounded-full ${isOpen ? "bg-[#25d366]" : "bg-gray-500"}`}
            />
            {isOpen ? "Open now" : "Closed now"}
          </>
        )}
      </p>
    </div>
  );
}
