import { LEVEL_TIERS, levelForXp } from './level';

describe('levelForXp', () => {
  it('starts at Intern with zero progress into the tier', () => {
    const info = levelForXp(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe('Intern');
    expect(info.progress01).toBe(0);
    expect(info.xpForNext).toBe(300);
  });

  it('sits exactly on a tier boundary at its threshold', () => {
    const info = levelForXp(1800);
    expect(info.title).toBe('Senior Developer');
    expect(info.xpIntoLevel).toBe(0);
    expect(info.progress01).toBe(0);
  });

  it('computes fractional progress within a tier', () => {
    // Junior Developer spans 300..800 (span 500); 550 XP = 250 into the tier
    const info = levelForXp(550);
    expect(info.title).toBe('Junior Developer');
    expect(info.xpIntoLevel).toBe(250);
    expect(info.progress01).toBeCloseTo(0.5);
    expect(info.xpForNext).toBe(250);
  });

  it('caps at GOAT with no next tier', () => {
    const info = levelForXp(LEVEL_TIERS[LEVEL_TIERS.length - 1].xpRequired + 9999);
    expect(info.title).toBe('GOAT');
    expect(info.level).toBe(9);
    expect(info.xpForNext).toBeNull();
    expect(info.progress01).toBe(1);
  });

  it('never regresses across the whole ladder', () => {
    let lastLevel = 0;
    for (let xp = 0; xp <= 21000; xp += 137) {
      const info = levelForXp(xp);
      expect(info.level).toBeGreaterThanOrEqual(lastLevel);
      lastLevel = info.level;
    }
  });
});
