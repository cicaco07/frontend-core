import { describe, it, expect } from 'vitest';
import {
	sumStats,
	scaleStatsByLevel,
	effectiveResistance,
	mitigationMultiplier,
	computeDamage,
	averageBasicAttack,
	attacksPerSecond,
	heroSkillDamage,
	skillBurst,
	effectiveHp
} from './formulas';
import { emptyStatBlock } from '../types/stats';
import type { HeroSkill } from '../types/hero';

describe('sumStats', () => {
	it('adds partial blocks onto a zero base', () => {
		const total = sumStats([{ physicalAttack: 50 }, { physicalAttack: 30, magicPower: 10 }]);
		expect(total.physicalAttack).toBe(80);
		expect(total.magicPower).toBe(10);
		expect(total.hp).toBe(0);
	});
});

describe('scaleStatsByLevel', () => {
	it('applies per-level growth for (level - 1) steps', () => {
		const base = { ...emptyStatBlock(), physicalAttack: 100 };
		const scaled = scaleStatsByLevel(base, { physicalAttack: 10 }, 5);
		expect(scaled.physicalAttack).toBe(140);
	});

	it('does not grow at level 1', () => {
		const base = { ...emptyStatBlock(), hp: 500 };
		const scaled = scaleStatsByLevel(base, { hp: 100 }, 1);
		expect(scaled.hp).toBe(500);
	});
});

describe('effectiveResistance', () => {
	it('applies percentage pen before subtracting flat pen', () => {
		expect(effectiveResistance(100, 10, 0.4)).toBe(50);
	});

	it('never returns below zero', () => {
		expect(effectiveResistance(20, 50, 0)).toBe(0);
	});
});

describe('mitigationMultiplier', () => {
	it('matches the 120/(120+res) curve', () => {
		expect(mitigationMultiplier(120)).toBeCloseTo(0.5);
		expect(mitigationMultiplier(0)).toBe(1);
	});
});

describe('computeDamage', () => {
	it('true damage ignores resistances', () => {
		const attacker = emptyStatBlock();
		const target = { ...emptyStatBlock(), physicalDefense: 999, magicDefense: 999 };
		expect(computeDamage({ rawDamage: 300, damageType: 'true', attacker, target })).toBe(300);
	});

	it('physical damage is mitigated by physical defense', () => {
		const attacker = emptyStatBlock();
		const target = { ...emptyStatBlock(), physicalDefense: 120 };
		expect(computeDamage({ rawDamage: 200, damageType: 'physical', attacker, target })).toBeCloseTo(
			100
		);
	});
});

describe('averageBasicAttack', () => {
	it('blends crit and non-crit by crit chance', () => {
		const attacker = {
			...emptyStatBlock(),
			physicalAttack: 100,
			critChancePct: 0.5,
			critDamagePct: 0
		};
		const target = emptyStatBlock();
		expect(averageBasicAttack(attacker, target)).toBeCloseTo(150);
	});
});

describe('attacksPerSecond', () => {
	it('scales base attack speed by the bonus ratio', () => {
		const attacker = { ...emptyStatBlock(), attackSpeedPct: 0.5 };
		expect(attacksPerSecond(attacker, 1)).toBeCloseTo(1.5);
	});
});

describe('heroSkillDamage', () => {
	const skill: HeroSkill = {
		id: 's1',
		name: 'Test',
		damageType: 'magic',
		baseDamage: [100, 150, 200],
		scaling: [{ stat: 'magicPower', ratio: 0.5 }]
	};

	it('picks base damage by rank (level - 1, capped) and adds scaling', () => {
		const attacker = { ...emptyStatBlock(), magicPower: 200 };
		const target = emptyStatBlock();
		expect(heroSkillDamage(skill, attacker, target, 2)).toBeCloseTo(250);
	});

	it('caps rank at the last base-damage entry', () => {
		const attacker = emptyStatBlock();
		const target = emptyStatBlock();
		expect(heroSkillDamage(skill, attacker, target, 15)).toBeCloseTo(200);
	});

	it('returns 0 for non-damaging skills', () => {
		const passive: HeroSkill = { ...skill, damageType: 'none' };
		expect(heroSkillDamage(passive, emptyStatBlock(), emptyStatBlock(), 1)).toBe(0);
	});
});

describe('skillBurst', () => {
	it('sums damage of all skills', () => {
		const skills: HeroSkill[] = [
			{ id: 'a', name: 'A', damageType: 'true', baseDamage: [100], scaling: [] },
			{ id: 'b', name: 'B', damageType: 'true', baseDamage: [50], scaling: [] },
			{ id: 'p', name: 'P', damageType: 'none', baseDamage: [], scaling: [] }
		];
		expect(skillBurst(skills, emptyStatBlock(), emptyStatBlock(), 1)).toBe(150);
	});
});

describe('effectiveHp', () => {
	it('true damage EHP equals raw hp', () => {
		const target = { ...emptyStatBlock(), hp: 5000, physicalDefense: 120 };
		expect(effectiveHp(target, 'true')).toBe(5000);
	});

	it('physical EHP grows with physical defense', () => {
		const target = { ...emptyStatBlock(), hp: 5000, physicalDefense: 120 };
		expect(effectiveHp(target, 'physical')).toBeCloseTo(10000);
	});
});
