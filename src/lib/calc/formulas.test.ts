import { describe, it, expect } from 'vitest';
import {
	sumStats,
	scaleStatsByLevel,
	effectiveResistance,
	mitigationMultiplier,
	computeDamage,
	averageBasicAttack,
	attacksPerSecond
} from './formulas';
import { emptyStatBlock } from '../types/stats';

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
