import React, { useRef, useCallback } from 'react';

interface LongPressOptions {
  /** ms to hold before firing (default 550) */
  delay?: number;
  /** max px the pointer may move before the press is cancelled (default 12) */
  moveTolerance?: number;
}

const isInteractive = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest('button, a, input, select, textarea, [role="button"]');
};

/**
 * Long-press (press & hold) handler for touch + mouse.
 * Ignores presses that start on interactive elements (buttons/links/inputs)
 * so normal taps inside a card keep working. Cancels if the pointer moves.
 * Fires a light haptic tick on mobile when the press registers.
 */
export function useLongPress(
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void,
  { delay = 550, moveTolerance = 12 }: LongPressOptions = {}
) {
  const timer = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    startPos.current = null;
  }, []);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (isInteractive(e.target)) return;
      fired.current = false;
      const t = 'touches' in e ? e.touches[0] : e;
      startPos.current = { x: t.clientX, y: t.clientY };
      timer.current = window.setTimeout(() => {
        fired.current = true;
        try {
          if (navigator.vibrate) navigator.vibrate(40);
        } catch {
          /* haptics optional */
        }
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!startPos.current || timer.current === null) return;
      const t = 'touches' in e ? e.touches[0] : e;
      const dx = t.clientX - startPos.current.x;
      const dy = t.clientY - startPos.current.y;
      if (Math.hypot(dx, dy) > moveTolerance) clear();
    },
    [clear, moveTolerance]
  );

  const end = useCallback(() => {
    clear();
    // swallow the synthetic click that follows a fired long-press on touch
    if (fired.current) {
      fired.current = false;
    }
  }, [clear]);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: clear,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: clear,
    onContextMenu: (e: React.MouseEvent) => {
      if (fired.current) e.preventDefault();
    },
  };
}

/**
 * Wrapper div that fires `onLongPress` when pressed & held.
 * Safe to use inside list maps (hook lives inside this component).
 */
export const LongPressable: React.FC<{
  onLongPress: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onLongPress, className, children }) => {
  const handlers = useLongPress(() => onLongPress());
  return (
    <div className={className} {...handlers}>
      {children}
    </div>
  );
};
