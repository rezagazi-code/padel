import React, { useMemo } from 'react';

interface BubbleSpec {
  left: number; // % across
  size: number; // px
  duration: number; // s
  delay: number; // s
  wobble: number; // px horizontal sway
}

/**
 * Ambient underwater bubbles: they rise from below, wobble gently,
 * and pop (burst) at random heights — like texts submerged in water.
 * Pure CSS animation, pointer-events-none, cheap to run.
 */
export const Bubbles: React.FC<{ count?: number; className?: string }> = ({
  count = 14,
  className = '',
}) => {
  const bubbles = useMemo<BubbleSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 71 + 13) % 100,
        size: 6 + ((i * 37) % 18),
        duration: 7 + ((i * 53) % 8),
        delay: -((i * 29) % 12),
        wobble: 12 + ((i * 17) % 20),
      })),
    [count]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={
            {
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              '--wobble': `${b.wobble}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
