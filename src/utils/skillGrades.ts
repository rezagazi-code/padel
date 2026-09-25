// Skill grades: letter-based player levels (A = strongest, D = weakest)
// with + / - modifiers. The numeric 1.00–7.00 level stays as the internal
// source of truth for filtering math; this module maps it to a grade.

export type SkillGrade =
  | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D+' | 'D' | 'D-';

/** Strongest → weakest */
export const SKILL_GRADES: SkillGrade[] = [
  'A+', 'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-',
  'D+', 'D', 'D-',
];

export function levelToGrade(level: number): SkillGrade {
  if (level >= 6.5) return 'A+';
  if (level >= 6.0) return 'A';
  if (level >= 5.5) return 'A-';
  if (level >= 5.0) return 'B+';
  if (level >= 4.5) return 'B';
  if (level >= 4.0) return 'B-';
  if (level >= 3.5) return 'C+';
  if (level >= 3.0) return 'C';
  if (level >= 2.5) return 'C-';
  if (level >= 2.0) return 'D+';
  if (level >= 1.5) return 'D';
  return 'D-';
}

/** Representative numeric value (band midpoint) for a grade. */
export const GRADE_MIDPOINT: Record<SkillGrade, number> = {
  'A+': 6.75, 'A': 6.25, 'A-': 5.75,
  'B+': 5.25, 'B': 4.75, 'B-': 4.25,
  'C+': 3.75, 'C': 3.25, 'C-': 2.75,
  'D+': 2.25, 'D': 1.75, 'D-': 1.25,
};

const BAND_FA: Record<string, string> = {
  A: 'حرفه‌ای',
  B: 'نیمه‌حرفه‌ای',
  C: 'متوسط',
  D: 'مبتدی',
};

/** Persian band name for a grade, e.g. 'B+' → 'نیمه‌حرفه‌ای'. */
export function gradeBandFa(grade: SkillGrade): string {
  return BAND_FA[grade.charAt(0)] ?? '';
}

/** e.g. level 3.85 → 'C+ · متوسط' */
export function levelLabel(level: number): string {
  const g = levelToGrade(level);
  return `${g} · ${gradeBandFa(g)}`;
}
