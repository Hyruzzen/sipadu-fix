import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const KabupatenBandungLogo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 500 560"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lambang Kabupaten Bandung - Repeh Rapih Kerta Raharja"
    >
      <defs>
        {/* Clip path for the shield outline so inner content stays neatly inside */}
        <clipPath id="shield-clip">
          <path d="M 90 20 L 410 20 L 410 250 C 410 380 250 490 250 490 C 250 490 90 380 90 250 Z" />
        </clipPath>

        {/* Clip path for bottom right wave area */}
        <clipPath id="wave-clip">
          <path d="M 250 210 L 410 370 L 410 250 C 410 380 250 490 250 490 Z" />
        </clipPath>
      </defs>

      {/* SHIELD BODY (Inside clipPath) */}
      <g clipPath="url(#shield-clip)">
        {/* 1. Yellow Background (Upper Right) */}
        <rect x="0" y="0" width="500" height="500" fill="#FED100" />

        {/* 2. Red Field (Lower Left) */}
        <polygon points="90,20 90,490 250,490 250,200" fill="#E31B23" />

        {/* 3. Blue & White Waves Field (Lower Right: Sungai Citarum) */}
        <g clipPath="url(#wave-clip)">
          {/* Base white */}
          <rect x="250" y="200" width="160" height="290" fill="#FFFFFF" />
          {/* Blue wavy bands */}
          {/* Wave 1 */}
          <path
            d="M 250 260 Q 290 245 330 260 T 410 260 L 410 285 Q 370 270 330 285 T 250 285 Z"
            fill="#009FE3"
          />
          {/* Wave 2 */}
          <path
            d="M 250 310 Q 290 295 330 310 T 410 310 L 410 335 Q 370 320 330 335 T 250 335 Z"
            fill="#009FE3"
          />
          {/* Wave 3 */}
          <path
            d="M 250 360 Q 290 345 330 360 T 410 360 L 410 385 Q 370 370 330 385 T 250 385 Z"
            fill="#009FE3"
          />
          {/* Wave 4 */}
          <path
            d="M 250 410 Q 290 395 330 410 T 410 410 L 410 435 Q 370 420 330 435 T 250 435 Z"
            fill="#009FE3"
          />
          {/* Wave 5 bottom */}
          <path
            d="M 250 460 Q 290 445 330 460 T 410 460 L 410 490 L 250 490 Z"
            fill="#009FE3"
          />
          {/* Vertical divider line */}
          <line x1="250" y1="210" x2="250" y2="490" stroke="#000000" strokeWidth="4" />
        </g>

        {/* 4. Green Trapezoid (Gunung Tangkuban Parahu) in yellow area */}
        <polygon points="265,120 360,120 380,140 245,140" fill="#1E824C" />

        {/* 5. Green Plant (Ranting Daun) in red area */}
        <g transform="translate(170, 310)">
          {/* Central Stem */}
          <path d="M 0 90 L 0 -85" stroke="#00A859" strokeWidth="8" strokeLinecap="round" />
          
          {/* Top Leaf */}
          <path d="M 0 -85 Q -18 -110 0 -130 Q 18 -110 0 -85 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
          
          {/* Side Leaves Pair 1 (Top) */}
          <path d="M -2 -70 Q -32 -85 -30 -60 Q -15 -50 -2 -60 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
          <path d="M 2 -70 Q 32 -85 30 -60 Q 15 -50 2 -60 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />

          {/* Side Leaves Pair 2 */}
          <path d="M -2 -40 Q -42 -55 -40 -30 Q -20 -20 -2 -30 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
          <path d="M 2 -40 Q 42 -55 40 -30 Q 20 -20 2 -30 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />

          {/* Side Leaves Pair 3 */}
          <path d="M -2 -10 Q -50 -25 -48 0 Q -24 10 -2 0 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
          <path d="M 2 -10 Q 50 -25 48 0 Q 24 10 2 0 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />

          {/* Side Leaves Pair 4 */}
          <path d="M -2 20 Q -55 5 -50 30 Q -26 40 -2 30 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
          <path d="M 2 20 Q 55 5 50 30 Q 26 40 2 30 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />

          {/* Side Leaves Pair 5 (Bottom) */}
          <path d="M -2 45 Q -50 35 -45 55 Q -22 65 -2 55 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
          <path d="M 2 45 Q 50 35 45 55 Q 22 65 2 55 Z" fill="#00A859" stroke="#007A3D" strokeWidth="2" />
        </g>

        {/* 6. Diagonal Black Crenellated Band (Benteng / Tangga) */}
        {/* Main diagonal black bar */}
        <polygon
          points="80,10 110,20 395,385 365,375"
          fill="#000000"
        />
        {/* Crenellations (Teeth) pointing southwest into red field */}
        {/* Tooth 1 */}
        <polygon points="120,50 142,75 130,86 108,61" fill="#000000" />
        {/* Tooth 2 */}
        <polygon points="146,80 168,105 156,116 134,91" fill="#000000" />
        {/* Tooth 3 */}
        <polygon points="172,110 194,135 182,146 160,121" fill="#000000" />
        {/* Tooth 4 */}
        <polygon points="198,140 220,165 208,176 186,151" fill="#000000" />
        {/* Tooth 5 */}
        <polygon points="224,170 246,195 234,206 212,181" fill="#000000" />
        {/* Tooth 6 */}
        <polygon points="250,200 272,225 260,236 238,211" fill="#000000" />
        {/* Tooth 7 */}
        <polygon points="276,230 298,255 286,266 264,241" fill="#000000" />
        {/* Tooth 8 */}
        <polygon points="302,260 324,285 312,296 290,271" fill="#000000" />
        {/* Tooth 9 */}
        <polygon points="328,290 350,315 338,326 316,301" fill="#000000" />
        {/* Tooth 10 */}
        <polygon points="354,320 376,345 364,356 342,331" fill="#000000" />
      </g>

      {/* SHIELD OUTER OUTLINE (Crisp Black Stroke) */}
      <path
        d="M 90 20 L 410 20 L 410 250 C 410 380 250 490 250 490 C 250 490 90 380 90 250 Z"
        stroke="#000000"
        strokeWidth="9"
        strokeLinejoin="round"
      />

      {/* 7. BOTTOM BANNER RIBBON (Pita Kuning: REPEH RAPIH KERTA RAHARJA) */}
      <g>
        {/* Ribbon Left Tail (Swallowtail fold) */}
        <polygon points="55,470 5,470 25,495 5,520 55,520 70,495" fill="#FED100" stroke="#000000" strokeWidth="4" />
        {/* Ribbon Fold shadow left */}
        <polygon points="55,520 70,495 70,520" fill="#D4A700" stroke="#000000" strokeWidth="2" />

        {/* Ribbon Right Tail (Swallowtail fold) */}
        <polygon points="445,470 495,470 475,495 495,520 445,520 430,495" fill="#FED100" stroke="#000000" strokeWidth="4" />
        {/* Ribbon Fold shadow right */}
        <polygon points="445,520 430,495 430,520" fill="#D4A700" stroke="#000000" strokeWidth="2" />

        {/* Main Ribbon Center Body */}
        <rect
          x="55"
          y="490"
          width="390"
          height="55"
          fill="#FED100"
          stroke="#000000"
          strokeWidth="5"
        />

        {/* Motto Text */}
        <text
          x="250"
          y="528"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="24"
          letterSpacing="0.5"
          fill="#000000"
        >
          REPEH RAPIH KERTA RAHARJA
        </text>
      </g>
    </svg>
  );
};
