import type { DollType, OutfitZone } from "@/lib/types";

// Базовая кукла из макета. Вещи гардероба перекрашивают соответствующие зоны.
export function DollSVG({
  outfit,
  dollType,
}: {
  outfit: Partial<Record<OutfitZone, { color: string }>>;
  dollType: DollType;
}) {
  const skin = "#F5E2C8";
  const hair = dollType === "nines"
    ? "#D4A870"
    : dollType === "paola" ? "#C89060" : dollType === "minikane" ? "#E8C080" : "#C8A060";

  const headColor = outfit.head?.color;
  const feetColor = outfit.feet?.color || "#C8A87A";
  const handItem = outfit.hand;

  const isNines = dollType === "nines";

  return (
    <svg viewBox="0 0 180 380" className="w-full h-full" style={{ filter: "drop-shadow(0 8px 24px rgba(58,46,39,0.12))" }}>
      {/* Hair back */}
      <ellipse cx="90" cy="55" rx="36" ry="42" fill={hair} />

      {/* Head accessory (hat/beret) */}
      {headColor && (
        <ellipse cx="90" cy="28" rx={isNines ? 28 : 34} ry={isNines ? 18 : 22} fill={headColor} opacity="0.93" />
      )}

      {/* Head */}
      <ellipse cx="90" cy="68" rx="32" ry="36" fill={skin} />

      {/* Cheeks */}
      <ellipse cx="72" cy="75" rx="9" ry="6" fill="#F0C0A8" opacity="0.4" />
      <ellipse cx="108" cy="75" rx="9" ry="6" fill="#F0C0A8" opacity="0.4" />

      {/* Eyes */}
      <ellipse cx="79" cy="63" rx="5" ry="6" fill="#5A4030" />
      <ellipse cx="101" cy="63" rx="5" ry="6" fill="#5A4030" />
      <circle cx="80.5" cy="61" r="2" fill="white" />
      <circle cx="102.5" cy="61" r="2" fill="white" />
      <circle cx="79" cy="63" r="1.5" fill="#201010" />
      <circle cx="101" cy="63" r="1.5" fill="#201010" />

      {/* Nose */}
      <ellipse cx="90" cy="73" rx="3" ry="2" fill="#E8C0A0" />

      {/* Mouth */}
      <path d="M83 82 Q90 88 97 82" stroke="#C08060" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Hair front strands */}
      <path d="M58 58 Q52 80 56 110" stroke={hair} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M122 58 Q128 80 124 110" stroke={hair} strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.9" />
      {!isNines && (
        <>
          <path d="M60 50 Q56 90 62 130" stroke={hair} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M120 50 Q124 90 118 130" stroke={hair} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7" />
        </>
      )}

      {/* Neck */}
      <rect x="81" y="100" width="18" height="16" rx="6" fill={skin} />

      {/* Body / Dress */}
      {outfit.body ? (
        <path
          d={isNines
            ? "M62 116 Q58 140 60 200 Q68 220 90 222 Q112 220 120 200 Q122 140 118 116 Q104 108 90 108 Q76 108 62 116Z"
            : "M58 116 Q52 150 54 230 Q64 248 90 250 Q116 248 126 230 Q128 150 122 116 Q108 106 90 106 Q72 106 58 116Z"
          }
          fill={outfit.body.color}
          opacity="0.93"
        />
      ) : (
        <>
          {/* Top */}
          <path
            d={isNines
              ? "M65 116 Q60 140 62 170 Q70 178 90 178 Q110 178 118 170 Q120 140 115 116 Q104 108 90 108 Q76 108 65 116Z"
              : "M60 116 Q54 148 56 190 Q66 200 90 202 Q114 200 124 190 Q126 148 120 116 Q108 106 90 106 Q72 106 60 116Z"
            }
            fill={outfit.top?.color || "#F0EBE3"}
            opacity="0.93"
          />
          {/* Bottom */}
          <path
            d={isNines
              ? "M62 170 Q60 195 62 220 Q70 228 90 230 Q110 228 118 220 Q120 195 118 170 Q110 175 90 176 Q70 175 62 170Z"
              : "M56 192 Q54 222 56 250 Q66 262 90 264 Q114 262 124 250 Q126 222 124 192 Q112 200 90 200 Q68 200 56 192Z"
            }
            fill={outfit.bottom?.color || "#E8DDD0"}
            opacity="0.93"
          />
        </>
      )}

      {/* Arms */}
      <path d="M58 120 Q42 140 40 175 Q44 185 52 182 Q58 168 62 148 Q62 134 64 120Z"
        fill={outfit.top?.color || outfit.body?.color || skin} opacity="0.9" />
      <path d="M122 120 Q138 140 140 175 Q136 185 128 182 Q122 168 118 148 Q118 134 116 120Z"
        fill={outfit.top?.color || outfit.body?.color || skin} opacity="0.9" />

      {/* Hands */}
      <ellipse cx="46" cy="184" rx="12" ry="10" fill={skin} />
      <ellipse cx="134" cy="184" rx="12" ry="10" fill={skin} />

      {/* Hand item */}
      {handItem && (
        <g>
          <ellipse cx="134" cy="200" rx="13" ry="11" fill={handItem.color} opacity="0.9" />
          <ellipse cx="147" cy="196" rx="5" ry="8" fill={handItem.color} opacity="0.7" />
        </g>
      )}

      {/* Legs */}
      {!isNines ? (
        <>
          <path d="M68 248 Q64 290 66 340 Q72 348 82 346 Q88 340 86 290 Q84 258 80 250Z"
            fill={outfit.bottom?.color || outfit.body?.color || skin} opacity="0.9" />
          <path d="M100 248 Q104 290 102 340 Q96 348 86 346 Q82 344 86 290 Q88 258 96 250Z"
            fill={outfit.bottom?.color || outfit.body?.color || skin} opacity="0.9" />
          <path d="M112 248 Q116 290 114 340 Q108 348 98 346 Q94 340 98 290 Q100 258 106 250Z"
            fill={outfit.bottom?.color || outfit.body?.color || skin} opacity="0.9" />
          {/* Feet */}
          <ellipse cx="74" cy="342" rx="18" ry="10" fill={feetColor} opacity="0.95" />
          <ellipse cx="106" cy="342" rx="18" ry="10" fill={feetColor} opacity="0.95" />
        </>
      ) : (
        <>
          <path d="M70 218 Q66 255 68 290 Q74 298 84 296 Q90 290 88 256 Q86 228 80 218Z"
            fill={outfit.bottom?.color || outfit.body?.color || skin} opacity="0.9" />
          <path d="M110 218 Q114 255 112 290 Q106 298 96 296 Q92 292 96 256 Q98 228 104 218Z"
            fill={outfit.bottom?.color || outfit.body?.color || skin} opacity="0.9" />
          <ellipse cx="74" cy="294" rx="15" ry="9" fill={feetColor} opacity="0.95" />
          <ellipse cx="106" cy="294" rx="15" ry="9" fill={feetColor} opacity="0.95" />
        </>
      )}
    </svg>
  );
}
