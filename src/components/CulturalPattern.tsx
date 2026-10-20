import React from 'react';

interface CulturalPatternProps {
  className?: string;
  variant?: 'subtle' | 'border' | 'banner';
}

export const FASO_RIBBON_SRC = '/assets/aistudio/Waving_ribbon_flag_of_burkina_faso_independence_day_banner_3d_illustration___Premium_Photo__1__9ff8d263.jpg';

export const WatermarkRibbon: React.FC<{
  variant?: 'screen' | 'card' | 'splash';
  className?: string;
}> = ({ variant = 'screen', className = '' }) => {
  if (variant === 'card') {
    return (
      <div className={`pointer-events-none absolute right-0 top-0 bottom-0 w-2/3 overflow-hidden select-none opacity-20 dark:opacity-15 mix-blend-screen ${className}`}>
        <img
          src={FASO_RIBBON_SRC}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-right transform scale-125 animate-ribbon-subtle origin-right"
        />
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden select-none opacity-10 dark:opacity-15 ${className}`}>
        <img
          src={FASO_RIBBON_SRC}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center transform scale-110 animate-ribbon-watermark"
        />
      </div>
    );
  }

  // Default 'screen' full background watermark
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      <div className="absolute -top-10 -right-20 w-[650px] sm:w-[850px] max-w-none opacity-[0.11] dark:opacity-[0.09] animate-ribbon-watermark">
        <img
          src={FASO_RIBBON_SRC}
          alt=""
          className="w-full h-auto object-contain filter drop-shadow-md"
        />
      </div>
      <div className="absolute -bottom-24 -left-20 w-[550px] sm:w-[700px] max-w-none opacity-[0.08] dark:opacity-[0.07] animate-ribbon-watermark rotate-180">
        <img
          src={FASO_RIBBON_SRC}
          alt=""
          className="w-full h-auto object-contain filter drop-shadow-md"
        />
      </div>
    </div>
  );
};

export const CulturalPattern: React.FC<CulturalPatternProps> = ({
  className = '',
  variant = 'subtle',
}) => {
  if (variant === 'border') {
    return (
      <div className={`h-1.5 w-full flex overflow-hidden ${className}`}>
        <div className="flex-1 bg-red-600"></div>
        <div className="w-6 bg-amber-400 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
        </div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 p-0.5 shadow-sm ${className}`}>
        <div className="relative overflow-hidden bg-slate-900 rounded-[14px] p-3 text-white">
          {/* Subtle animated ribbon inside banner */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={FASO_RIBBON_SRC}
              alt=""
              className="w-full h-full object-cover animate-ribbon-subtle"
            />
          </div>
          <div className="relative z-10 flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Faso Dan Fani & Ruban National • Fierté & Intégrité
            </span>
            <span className="text-amber-300 font-mono font-bold">Burkina Faso 🇧🇫</span>
          </div>
        </div>
      </div>
    );
  }

  // Subtle woven pattern SVG
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 opacity-[0.03] select-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(#d97706 1px, transparent 1px), radial-gradient(#059669 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    />
  );
};

export const FASO_EMBLEM_SRC = '/assets/aistudio/Burkina_Faso_-_Uagadug__65f2bac5.jpg';

export const FasoLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; showTagline?: boolean }> = ({
  size = 'md',
  showTagline = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`relative rounded-2xl overflow-hidden shadow-md bg-white p-0.5 border-2 border-amber-400/80 shrink-0 ${sizeClasses[size]} flex items-center justify-center transition-transform hover:scale-105`}>
        <img
          src={FASO_EMBLEM_SRC}
          alt="Armoiries officielles du Burkina Faso - Logo FASO"
          className="w-full h-full object-contain drop-shadow-xs"
        />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-wider text-slate-900 dark:text-white font-['Space_Grotesk',sans-serif] leading-none ${titleSizes[size]}`}>
            FASO
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
            BF
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium">
            Unité • Progrès • Justice — Portefeuille Numérique
          </p>
        )}
      </div>
    </div>
  );
};
