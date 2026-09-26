import React from 'react';

export interface WaveData {
  id: number;
  x: number;
  y: number;
  targetTheme: 'light' | 'dark';
  maxRadius: number;
}

interface ThemeWaveOverlayProps {
  currentWave: WaveData | null;
  onWaveEnd: (id: number) => void;
}

export const ThemeWaveOverlay: React.FC<ThemeWaveOverlayProps> = ({ currentWave, onWaveEnd }) => {
  if (!currentWave) return null;

  const { id, x, y, targetTheme, maxRadius } = currentWave;
  const isLight = targetTheme === 'light';

  return (
    <div
      key={id}
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden"
      aria-hidden="true"
      onAnimationEnd={() => onWaveEnd(id)}
    >
      {/* Origin Sparkle Pulse */}
      <div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 animate-[cornerPulseBurst_0.4s_ease-out_forwards]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '40px',
          height: '40px',
          background: isLight
            ? 'radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0) 70%)'
            : 'radial-gradient(circle, rgba(253, 224, 71, 0.85) 0%, rgba(129, 140, 248, 0) 70%)',
        }}
      />

      {/* Primary Luminous Wave Shockwave Ring */}
      <div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${maxRadius * 2}px`,
          height: `${maxRadius * 2}px`,
          animation: 'cornerWaveExpand 0.75s cubic-bezier(0.2, 0.8, 0.25, 1) forwards',
          border: isLight
            ? '2.5px solid rgba(245, 158, 11, 0.85)'
            : '2.5px solid rgba(251, 191, 36, 0.85)',
          boxShadow: isLight
            ? '0 0 35px 8px rgba(251, 191, 36, 0.6), inset 0 0 25px 6px rgba(245, 158, 11, 0.35)'
            : '0 0 40px 10px rgba(129, 140, 248, 0.5), inset 0 0 25px 6px rgba(251, 191, 36, 0.4)',
        }}
      />

      {/* Secondary Echo Ripple (Offset by 80ms) */}
      <div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${maxRadius * 2}px`,
          height: `${maxRadius * 2}px`,
          animation: 'cornerWaveExpand 0.85s cubic-bezier(0.2, 0.8, 0.25, 1) 0.08s forwards',
          border: isLight
            ? '1.5px solid rgba(251, 191, 36, 0.5)'
            : '1.5px solid rgba(167, 139, 250, 0.5)',
          boxShadow: isLight
            ? '0 0 20px 4px rgba(245, 158, 11, 0.3)'
            : '0 0 25px 5px rgba(96, 165, 250, 0.3)',
        }}
      />

      {/* Third Ambient Liquid Crest */}
      <div
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${maxRadius * 2}px`,
          height: `${maxRadius * 2}px`,
          animation: 'cornerWaveExpand 0.95s cubic-bezier(0.2, 0.8, 0.25, 1) 0.16s forwards',
          border: isLight
            ? '1px solid rgba(253, 224, 71, 0.3)'
            : '1px solid rgba(251, 191, 36, 0.3)',
        }}
      />
    </div>
  );
};

export default ThemeWaveOverlay;
