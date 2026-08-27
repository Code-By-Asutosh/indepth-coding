import { LevelInfo } from '../models/learning.model';

/**
 * The GOAT ladder — XP thresholds mapped to engineering titles. Pure functions,
 * no Angular, trivially testable.
 *
 * Total available XP across all 404 concepts lands well past the top tier
 * (core concepts alone would be ~100 XP each), so GOAT stays aspirational.
 */
export interface LevelTier {
  level: number;
  title: string;
  xpRequired: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: 'Intern', xpRequired: 0 },
  { level: 2, title: 'Junior Developer', xpRequired: 300 },
  { level: 3, title: 'Developer', xpRequired: 800 },
  { level: 4, title: 'Senior Developer', xpRequired: 1800 },
  { level: 5, title: 'Staff Engineer', xpRequired: 3500 },
  { level: 6, title: 'Architect', xpRequired: 6000 },
  { level: 7, title: 'Principal Engineer', xpRequired: 9500 },
  { level: 8, title: 'Distinguished Engineer', xpRequired: 14000 },
  { level: 9, title: 'GOAT', xpRequired: 20000 }
];

export function levelForXp(xp: number): LevelInfo {
  let tier = LEVEL_TIERS[0];
  let next: LevelTier | null = null;
  for (const candidate of LEVEL_TIERS) {
    if (xp >= candidate.xpRequired) {
      tier = candidate;
    } else {
      next = candidate;
      break;
    }
  }

  const xpIntoLevel = xp - tier.xpRequired;
  const span = next ? next.xpRequired - tier.xpRequired : null;
  return {
    level: tier.level,
    title: tier.title,
    xpIntoLevel,
    xpForNext: next ? next.xpRequired - xp : null,
    progress01: span && span > 0 ? Math.min(1, xpIntoLevel / span) : 1
  };
}
