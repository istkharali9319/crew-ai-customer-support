import { useId } from "react";

/**
 * Friendly support-robot mascot, drawn as an SVG so it stays sharp at any size.
 *
 * variant="full"  → whole robot (head + body + chat badge), used on the welcome screen
 * variant="head"  → just the head, used as the agent's avatar
 */
export default function BotMascot({ variant = "full", size = 160, className = "", title = "Support Assistant robot" }) {
  // Gradient ids must be unique on the page because the mascot appears many times.
  const id = useId().replace(/:/g, "");
  const shell = `shell-${id}`;
  const blue = `blue-${id}`;
  const visor = `visor-${id}`;

  const isFull = variant === "full";
  const viewBox = isFull ? "18 6 164 228" : "20 10 160 160";
  const height = isFull ? Math.round((size * 228) / 164) : size;

  return (
    <svg
      className={className}
      width={size}
      height={height}
      viewBox={viewBox}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={shell} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe6f3" />
        </linearGradient>
        <linearGradient id={blue} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4d8dff" />
          <stop offset="1" stopColor="#1f56d6" />
        </linearGradient>
        <linearGradient id={visor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2a4a" />
          <stop offset="1" stopColor="#0b1428" />
        </linearGradient>
      </defs>

      {/* ---------- Body (full variant only) ---------- */}
      {isFull && (
        <g>
          {/* arms */}
          <rect x="44" y="150" width="22" height="50" rx="11" fill={`url(#${shell})`} stroke="#c7d2e6" strokeWidth="1.5" />
          <rect x="134" y="150" width="22" height="50" rx="11" fill={`url(#${shell})`} stroke="#c7d2e6" strokeWidth="1.5" />
          {/* torso */}
          <rect x="60" y="140" width="80" height="86" rx="34" fill={`url(#${shell})`} stroke="#c7d2e6" strokeWidth="1.5" />
          {/* chat badge on the chest */}
          <circle cx="100" cy="180" r="19" fill={`url(#${blue})`} />
          <path d="M89 172 h22 a4 4 0 0 1 4 4 v9 a4 4 0 0 1 -4 4 h-12 l-6 5 v-5 h-4 a4 4 0 0 1 -4 -4 v-9 a4 4 0 0 1 4 -4 z" fill="#fff" />
          <circle cx="94.5" cy="180.5" r="1.8" fill="#2a63e6" />
          <circle cx="100" cy="180.5" r="1.8" fill="#2a63e6" />
          <circle cx="105.5" cy="180.5" r="1.8" fill="#2a63e6" />
          {/* neck */}
          <rect x="78" y="132" width="44" height="12" rx="6" fill="#1b2a4a" />
        </g>
      )}

      {/* ---------- Antenna ---------- */}
      <line x1="100" y1="30" x2="100" y2="46" stroke="#1b2a4a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="24" r="8" fill={`url(#${blue})`} />
      <circle cx="97.5" cy="21.5" r="2.2" fill="#ffffff" opacity=".7" />

      {/* ---------- Headband ---------- */}
      <path d="M40 92 A60 60 0 0 1 160 92" fill="none" stroke="#1b2a4a" strokeWidth="5" strokeLinecap="round" />

      {/* ---------- Head ---------- */}
      <rect x="44" y="44" width="112" height="94" rx="44" fill={`url(#${shell})`} stroke="#c7d2e6" strokeWidth="1.5" />

      {/* ---------- Face screen ---------- */}
      <rect x="57" y="62" width="86" height="58" rx="26" fill={`url(#${visor})`} />
      {/* screen shine */}
      <path d="M66 74 q6 -6 16 -6" stroke="#ffffff" strokeOpacity=".18" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* happy eyes */}
      <g className="bot-eyes" stroke="#6ee7f9" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M75 92 q8 -10 16 0" />
        <path d="M109 92 q8 -10 16 0" />
      </g>
      {/* smile */}
      <path d="M91 104 q9 8 18 0" stroke="#6ee7f9" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* ---------- Headphones ---------- */}
      <rect x="28" y="72" width="22" height="42" rx="11" fill={`url(#${blue})`} />
      <rect x="150" y="72" width="22" height="42" rx="11" fill={`url(#${blue})`} />
      <rect x="33" y="80" width="6" height="26" rx="3" fill="#ffffff" opacity=".25" />

      {/* ---------- Microphone ---------- */}
      <path d="M163 112 C163 132 150 142 130 142" stroke="#1b2a4a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="116" y="136" width="18" height="12" rx="6" fill="#1b2a4a" />
    </svg>
  );
}
