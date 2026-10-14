import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const BackgroundEffect: React.FC = () => {
  const { backgroundEffect, reducedMotion } = useAppStore();

  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 5,
      opacity: 0.15 + Math.random() * 0.25
    }));
  }, []);

  const petals = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 12 + Math.random() * 14,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 6,
      rotate: Math.random() * 360
    }));
  }, []);

  if (backgroundEffect === 'none' || reducedMotion) {
    return null;
  }

  if (backgroundEffect === 'gradient') {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-accent-400/10 dark:bg-accent-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>
    );
  }

  if (backgroundEffect === 'particles') {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-accent-400 dark:bg-accent-300 blur-[1px] animate-pulse-subtle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (backgroundEffect === 'sakura') {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="absolute animate-float-gentle"
            style={{
              left: `${petal.x}%`,
              top: `${(petal.id * 6) % 90}%`,
              width: `${petal.size}px`,
              height: `${petal.size * 1.4}px`,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              transform: `rotate(${petal.rotate}deg)`
            }}
          >
            {/* Sakura petal SVG */}
            <svg viewBox="0 0 30 40" className="w-full h-full drop-shadow-sm opacity-35 dark:opacity-20">
              <path
                d="M15 0 C25 15, 30 30, 15 40 C0 30, 5 15, 15 0 Z"
                fill="#fbcfe8"
              />
            </svg>
          </div>
        ))}
      </div>
    );
  }

  return null;
};
