import React, { useRef, useCallback } from 'react';

interface WaterRippleProps {
  className?: string;
  children: React.ReactNode;
  /** water tint: 'aqua' (default cyan-blue) */
  tint?: 'aqua';
}

/**
 * Water-touch wrapper: on tap, a liquid ripple blooms from the touch point —
 * a bright aqua core with a soft trailing ring, like a droplet hitting water.
 * Wrap any button/card with it (needs relative + overflow-hidden parents,
 * which this component provides).
 */
export const WaterRipple: React.FC<WaterRippleProps> = ({ className = '', children }) => {
  const ref = useRef<HTMLSpanElement>(null);

  const spawn = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Ripple diameter covers the whole element from the tap point
    const d = Math.max(rect.width, rect.height) * 2.4;

    const ripple = document.createElement('span');
    ripple.className = 'water-ripple';
    ripple.style.width = `${d}px`;
    ripple.style.height = `${d}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.addEventListener('animationend', () => ripple.remove());
    el.appendChild(ripple);

    // Trailing second ring, slightly delayed — the "echo" of the droplet
    const ring = document.createElement('span');
    ring.className = 'water-ripple water-ripple-ring';
    ring.style.width = `${d}px`;
    ring.style.height = `${d}px`;
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.addEventListener('animationend', () => ring.remove());
    el.appendChild(ring);
  }, []);

  return (
    <span
      ref={ref}
      onPointerDown={spawn}
      className={`water-ripple-host ${className}`}
    >
      {children}
    </span>
  );
};
