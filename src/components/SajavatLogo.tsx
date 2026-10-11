import React from 'react';

interface SajavatLogoProps {
  className?: string;
  variant?: 'on-burgundy' | 'on-light' | 'badge' | 'compact' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const SajavatLogo: React.FC<SajavatLogoProps> = ({
  className = '',
  variant = 'badge',
  size = 'md',
  showTagline = true,
}) => {
  // Dimension presets for the official brand logo image
  const imgSizeMap = {
    sm: 'h-10 w-10 rounded-lg',
    md: 'h-12 w-12 sm:h-14 sm:w-14 rounded-xl',
    lg: 'h-14 w-14 sm:h-16 sm:w-16 rounded-xl',
    xl: 'h-24 w-24 sm:h-28 sm:w-28 rounded-2xl',
  };

  const titleSizeMap = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const taglineSizeMap = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const imgSizeClass = imgSizeMap[size] || imgSizeMap.md;
  const titleSizeClass = titleSizeMap[size] || titleSizeMap.md;
  const taglineSizeClass = taglineSizeMap[size] || taglineSizeMap.md;

  // Variant styling
  const isDarkBg = variant === 'on-burgundy';
  const textColor = isDarkBg ? 'text-[#FFF9F2]' : 'text-[#800020]';
  const tagColor = isDarkBg ? 'text-[#F3E6D5]' : 'text-[#800020]/80';

  // Badge or Compact variant: standalone official logo image
  if (variant === 'badge' || variant === 'compact') {
    return (
      <img
        src="/Sajavat.svg"
        alt="Sajavat — Decore For Every Celebration"
        className={`${imgSizeClass} object-contain shadow-md border border-[#D4AF37]/35 select-none ${className}`}
      />
    );
  }

  // Horizontal variant:
  // Displays the official logo image alongside the brand name and tagline
  return (
    <div className={`inline-flex items-center gap-3.5 select-none group ${className}`}>
      <img
        src="/Sajavat.svg"
        alt="Sajavat — Decore For Every Celebration"
        className={`${imgSizeClass} object-contain shadow-md border border-[#D4AF37]/35 flex-shrink-0 transition-transform group-hover:scale-105`}
      />
      <div className="flex flex-col text-left">
        <span className={`font-serif font-semibold tracking-tight ${textColor} ${titleSizeClass} leading-none`}>
          Sajavat
        </span>
        {showTagline && (
          <span className={`font-serif italic tracking-wide ${tagColor} ${taglineSizeClass} mt-1 leading-none`}>
            Decore For Every Celebration
          </span>
        )}
      </div>
    </div>
  );
};
