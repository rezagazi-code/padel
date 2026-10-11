import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  /** Current value 0..5 (fractional ok for display) */
  value: number;
  /** If provided, stars become tappable and call onRate(1..5) */
  onRate?: (stars: number) => void;
  size?: number;
  className?: string;
}

/** Star rating display + optional interactive voting. */
export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onRate,
  size = 20,
  className = '',
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const interactive = typeof onRate === 'function';

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      dir="ltr"
      onMouseLeave={() => interactive && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = shown >= n - 0.25;
        const half = !filled && shown >= n - 0.75;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(n)}
            onMouseEnter={() => interactive && setHover(n)}
            className={
              interactive
                ? 'cursor-pointer transition-transform hover:scale-125 active:scale-95 p-0.5'
                : 'p-0.5 cursor-default'
            }
            aria-label={interactive ? `امتیاز ${n} از ۵` : `امتیاز ${value} از ۵`}
          >
            <Star
              style={{ width: size, height: size }}
              className={
                filled
                  ? 'text-[#facc15] fill-current'
                  : half
                    ? 'text-[#facc15] fill-current opacity-50'
                    : 'text-slate-600'
              }
            />
          </button>
        );
      })}
    </div>
  );
};
