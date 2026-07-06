import { describe, expect, it } from 'vitest';
import {
	computeItemModifierStats,
	computeItemPenetrationStats,
	itemBasicAttackExtraDamage,
	emptyItemModifierState
} from './apply-item-modifiers';
import { emptyStatBlock, type StatBlock } from '$lib/types/stats';
import type { Item } from '$lib/types/equipment';

const item = (slug: string): Item => ({
	id: slug,
	slug,
	name: slug,
	type: 'Attack',
	category: 'attack',
	tier: 'TIER_3',
	cost: 0,
	imageUrl: '',
	stats: {},
	calculationAttributes: []
});

const stats = (partial: Partial<StatBlock> = {}): StatBlock => ({ ...emptyStatBlock(), ...partial });

describe('item modifiers', () => {
	it('applies Brute Force Breastplate stacks as adaptive physical attack for fighter roles', () => {
		const state = emptyItemModifierState();
		state.itemStacks['brute-force-breastplate'] = 6;
		const bonus = computeItemModifierStats([item('brute-force-breastplate')], state, {
			level: 15,
			heroRole: 'fighter',
			heroSlug: 'zilong',
			baseStats: stats(),
			target: stats()
		});
		expect(bonus.physicalAttack).toBe(36);
		expect(bonus.magicPower).toBe(0);
		expect(bonus.movementSpeedPct).toBeCloseTo(0.12);
		expect(bonus.controlDurationReductionPct).toBeCloseTo(0.15);
	});

	it('converts Golden Staff crit chance into attack speed and clears crit chance', () => {
		const state = emptyItemModifierState();
		state.itemToggles['golden-staff'] = true;
		const bonus = computeItemModifierStats([item('golden-staff')], state, {
			level: 15,
			heroRole: 'marksman',
			baseStats: stats({ critChancePct: 0.25 }),
			target: stats()
		});
		expect(bonus.attackSpeedPct).toBeCloseTo(1.05);
		expect(bonus.critChancePct).toBeCloseTo(-0.25);
		expect(bonus.attackSpeedCapPct).toBe(5);
	});

	it('caps Malefic Roar and Divine Glaive penetration bonuses', () => {
		const bonus = computeItemPenetrationStats([item('malefic-roar'), item('divine-glaive')], {
			target: stats({ physicalDefense: 500, magicDefense: 500 })
		});
		expect(bonus.physicalPenPct).toBeCloseTo(0.3);
		expect(bonus.magicPenPct).toBeCloseTo(0.2);
	});

	it('scales Sky Piercer execute threshold by stacks', () => {
		const state = emptyItemModifierState();
		state.itemStacks['sky-piercer'] = 80;
		const bonus = computeItemModifierStats([item('sky-piercer')], state, {
			level: 15,
			baseStats: stats(),
			target: stats()
		});
		expect(bonus.executeThresholdPct).toBeCloseTo(0.12);
	});

	it('uses target current HP for Demon Hunter Sword damage', () => {
		const state = emptyItemModifierState();
		state.itemToggles['demon-hunter-sword'] = true;
		state.targetCurrentHpPct = 0.5;
		const damage = itemBasicAttackExtraDamage(
			[item('demon-hunter-sword')],
			state,
			stats({ physicalPenPct: 1 }),
			stats({ hp: 1000 }),
			15,
			'marksman'
		);
		expect(damage).toBeCloseTo(40);
	});

	it('applies Golden Staff attack effect multiplier to on-hit item damage', () => {
		const state = emptyItemModifierState();
		state.itemToggles['golden-staff'] = true;
		state.itemToggles['swift-crossbow'] = true;
		const damage = itemBasicAttackExtraDamage(
			[item('golden-staff'), item('swift-crossbow')],
			state,
			stats({ physicalAttack: 100, physicalPenPct: 1 }),
			stats(),
			15,
			'marksman'
		);
		expect(damage).toBeCloseTo(120);
	});
});
