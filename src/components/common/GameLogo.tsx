/* antislop: Authentic vector typography logo for MISSION AUTOPSY; pure geometric SVG without pixel distortion */
import React from 'react';

interface GameLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const GameLogo: React.FC<GameLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const dims = {
    sm: { width: 180, height: 42, titleSize: 18, subSize: 8 },
    md: { width: 260, height: 60, titleSize: 24, subSize: 10 },
    lg: { width: 360, height: 84, titleSize: 32, subSize: 12 },
  }[size];

  return (
    <svg
      viewBox="0 0 360 84"
      width={dims.width}
      height={dims.height}
      className={`select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orbital Crosshair Mark */}
      <circle cx="28" cy="42" r="20" stroke="#eab308" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="28" cy="42" r="10" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="28" cy="42" r="3" fill="#eab308" />
      <line x1="28" y1="14" x2="28" y2="70" stroke="#eab308" strokeWidth="1" opacity="0.4" />
      <line x1="0" y1="42" x2="56" y2="42" stroke="#eab308" strokeWidth="1" opacity="0.4" />

      {/* Primary Brand Typography */}
      <text
        x="64"
        y="38"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#f8fafc"
        letterSpacing="2.5"
      >
        MISSION AUTOPSY
      </text>

      {/* Telemetry Accent Line */}
      <path
        d="M 64 47 L 230 47 L 238 53 L 340 53"
        stroke="#22d3ee"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <circle cx="340" cy="53" r="2" fill="#22d3ee" />

      {/* Subtitle */}
      {showSubtitle && (
        <text
          x="64"
          y="66"
          fontFamily="monospace"
          fontWeight="700"
          fontSize="9.5"
          fill="#eab308"
          letterSpacing="3"
        >
          THE LAST TELEMETRY • ORBITA NOVA
        </text>
      )}
    </svg>
  );
};
