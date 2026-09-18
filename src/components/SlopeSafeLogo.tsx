import React from 'react';

interface SlopeSafeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  withGlow?: boolean;
  showText?: boolean;
  subtext?: string;
  id?: string;
}

const sizeMap = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  xl: 'w-14 h-14',
  '2xl': 'w-16 h-16',
};

export const SlopeSafeLogo: React.FC<SlopeSafeLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = false,
  showText = false,
  subtext,
  id = 'slope-safe-pictorial-logo',
}) => {
  const dimensionClass = sizeMap[size] || sizeMap.md;

  return (
    <div id={id} className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex-shrink-0 group">
        {/* Pictorial Vintage Shield Emblem */}
        <div
          className={`relative ${dimensionClass} rounded-lg overflow-hidden border border-[#9A8159] bg-[#FAF5E6] shadow-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
          style={{ boxShadow: '0 2px 5px rgba(60, 42, 20, 0.12)' }}
        >
          {/* Custom SVG Shield with Leaf / Slope Contour */}
          <svg viewBox="0 0 40 44" className="w-full h-full p-1 fill-none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Shield Outline */}
            <path
              d="M20 3 C27 3, 36 6, 37 15 C37 28, 28 36, 20 41 C12 36, 3 28, 3 15 C4 6, 13 3, 20 3 Z"
              fill="#F4EBD7"
              stroke="#5D4B34"
              strokeWidth="2"
            />
            {/* Inner Shield Shading */}
            <path
              d="M20 6 C25 6, 33 8, 34 16 C34 26, 26 33, 20 37 C14 33, 6 26, 6 16 C7 8, 15 6, 20 6 Z"
              fill="#EAE0C7"
              stroke="#877150"
              strokeWidth="1"
              strokeDasharray="2, 2"
            />
            {/* Green Leaf / Slope Contour Silhouette */}
            <path
              d="M13 25 C13 25, 14 14, 20 10 C26 14, 27 25, 27 25 C24 29, 16 29, 13 25 Z"
              fill="#4A6F44"
              stroke="#324B2D"
              strokeWidth="1.2"
            />
            {/* Leaf Vein / Mountain Ridge Incline */}
            <path
              d="M20 10 L20 28"
              stroke="#CBE4BC"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M16 18 L20 21"
              stroke="#CBE4BC"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M24 18 L20 21"
              stroke="#CBE4BC"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-lg text-[#2C2114] tracking-tight leading-tight">
              Slope Safe
            </span>
          </div>
          <span className="font-serif text-xs text-[#6B5A44] leading-tight">
            Dashboard
          </span>
        </div>
      )}
    </div>
  );
};
