interface GradeBadgeProps {
  grade: string;
  className?: string;
}

/** Letter-grade chip (A+ … D-) used everywhere a player level is shown. */
export default function GradeBadge({ grade, className = '' }: GradeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[2.1rem] px-1.5 py-0.5 rounded-lg text-xs font-black text-white bg-gradient-to-br from-[#ff2d55]/90 to-[#2f7bff]/90 border border-white/20 shadow-[0_2px_10px_rgba(255,45,85,0.25)] ${className}`}
      dir="ltr"
    >
      {grade}
    </span>
  );
}
