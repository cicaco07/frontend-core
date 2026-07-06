import type { Item } from '$lib/types/equipment';
import type { DamageType, HeroRole, StatBlock } from '$lib/types/stats';
import { emptyStatBlock } from '$lib/types/stats';

export interface ItemModifierState {
	itemStacks: Record<string, number>;
	itemToggles: Record<string, boolean>;
	targetHigherExtraHp: boolean;
	targetLowHp: boolean;
	selfHpPct: number;
}

export interface ItemModifierContext {
	level: number;
	heroRole?: HeroRole;
	baseStats: StatBlock;
	target: StatBlock;
}

export function emptyItemModifierState(): ItemModifierState {
	return {
		itemStacks: {},
		itemToggles: {},
		targetHigherExtraHp: false,
		targetLowHp: false,
		selfHpPct: 1
	};
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const hasItem = (items: Item[], slug: string) => items.some((item) => item.slug === slug);
const stack = (state: ItemModifierState, slug: string, max: number) =>
	clamp(state.itemStacks[slug] ?? 0, 0, max);
const enabled = (state: ItemModifierState, slug: string) => state.itemToggles[slug] ?? false;
const reducedWarAxeRole = (role?: HeroRole) => role === 'marksman' || role === 'mage' || role === 'support';

export function computeItemModifierStats(
	items: Item[],
	state: ItemModifierState,
	context: ItemModifierContext
): Partial<StatBlock> {
	const result = emptyStatBlock();

	if (hasItem(items, 'brute-force-breastplate')) {
		const stacks = stack(state, 'brute-force-breastplate', 6);
		result.adaptiveAttack += stacks * 6;
		result.physicalAttack += stacks * 6;
		result.magicPower += stacks * 6;
		result.movementSpeedPct += stacks * 0.02;
		if (stacks >= 6) result.controlDurationReductionPct += 0.15;
	}

	if (hasItem(items, 'war-axe')) {
		const stacks = stack(state, 'war-axe', 6);
		const roleFactor = reducedWarAxeRole(context.heroRole) ? 0.5 : 1;
		result.physicalAttack += stacks * 12 * roleFactor;
	}

	if (hasItem(items, 'clock-of-destiny')) {
		const stacks = stack(state, 'clock-of-destiny', 6);
		const perStack = 4.5 + 0.5 * context.level;
		result.physicalDefense += perStack * stacks;
		result.magicDefense += perStack * stacks;
	}

	if (hasItem(items, 'concentrated-energy')) {
		const stacks = stack(state, 'concentrated-energy', 6);
		result.magicPower += stacks * 5;
	}

	if (hasItem(items, 'radiant-armor')) {
		const stacks = stack(state, 'radiant-armor', 6);
		const t = clamp((context.level - 1) / 14, 0, 1);
		const perStack = 6 + (20 - 6) * t;
		result.magicDefense += perStack * stacks;
	}

	if (hasItem(items, 'berserkers-fury') && enabled(state, 'berserkers-fury')) {
		result.physicalAttack += context.baseStats.physicalAttack * 0.05;
	}

	if (hasItem(items, 'haass-claws') && enabled(state, 'haass-claws')) {
		result.attackSpeedPct += 0.2;
	}

	if (hasItem(items, 'blade-of-despair') && (enabled(state, 'blade-of-despair') || state.targetLowHp)) {
		result.physicalAttack += context.baseStats.physicalAttack * 0.25;
	}

	if (hasItem(items, 'rose-gold-meteor')) {
		let hybridDefense = Math.min(context.baseStats.physicalAttack / 4, 50);
		if (context.heroRole !== 'fighter') hybridDefense *= 0.5;
		result.physicalDefense += hybridDefense;
		result.magicDefense += hybridDefense;
	}

	return result;
}

export function computeItemPenetrationStats(
	items: Item[],
	context: Pick<ItemModifierContext, 'target'>
): Partial<StatBlock> {
	const result = emptyStatBlock();
	if (hasItem(items, 'malefic-roar')) {
		result.physicalPenPct += Math.min(context.target.physicalDefense * 0.001, 0.3);
	}
	if (hasItem(items, 'divine-glaive')) {
		result.magicPenPct += Math.min(context.target.magicDefense * 0.001, 0.2);
	}
	return result;
}

export function adjustTargetWithItemModifiers(
	target: StatBlock,
	items: Item[],
	state: ItemModifierState,
	level: number
): StatBlock {
	const adjusted = { ...target };
	if (hasItem(items, 'genius-wand')) {
		const stacks = stack(state, 'genius-wand', 3);
		adjusted.magicDefense = Math.max(0, adjusted.magicDefense - (3 + 0.3 * level) * stacks);
	}
	return adjusted;
}

export function itemDamageBonusPct(
	items: Item[],
	state: ItemModifierState,
	damageType: DamageType,
	heroRole?: HeroRole
): number {
	let bonus = 0;
	if (hasItem(items, 'concentrated-energy') && damageType === 'magic' && stack(state, 'concentrated-energy', 6) >= 6) {
		bonus += 0.12;
	}
	if (hasItem(items, 'sea-halberd') && state.targetHigherExtraHp) {
		bonus += 0.08;
	}
	if (hasItem(items, 'queens-wings')) {
		const hpLostPct = 1 - clamp(state.selfHpPct, 0, 1);
		bonus += Math.min(hpLostPct * 100 * 0.0025, 0.15);
	}
	if (hasItem(items, 'war-axe') && stack(state, 'war-axe', 6) >= 6) {
		bonus += reducedWarAxeRole(heroRole) ? 0.05 : 0.1;
	}
	return bonus;
}

export function itemBasicAttackExtraDamage(
	items: Item[],
	state: ItemModifierState,
	attacker: StatBlock,
	target: StatBlock,
	level: number,
	heroRole?: HeroRole
): number {
	let extra = 0;
	const add = (rawDamage: number, damageType: DamageType, canCrit = false) => {
		let damage = rawDamage;
		if (damageType !== 'true') {
			const defense = damageType === 'physical' ? target.physicalDefense : target.magicDefense;
			const penFlat = damageType === 'physical' ? attacker.physicalPenFlat : attacker.magicPenFlat;
			const penPct = damageType === 'physical' ? attacker.physicalPenPct : attacker.magicPenPct;
			const effective = Math.max(-60, defense * (1 - penPct) - penFlat);
			damage *= 120 / (120 + effective);
		}
		if (canCrit) {
			damage *= 1 + Math.min(Math.max(attacker.critChancePct, 0), 1) * (1 + attacker.critDamagePct);
		}
		extra += Math.max(0, damage);
	};

	if (hasItem(items, 'demon-hunter-sword') && enabled(state, 'demon-hunter-sword')) add(target.hp * 0.08, 'physical');
	if (hasItem(items, 'feather-of-heaven') && enabled(state, 'feather-of-heaven')) add(50 + attacker.magicPower * 0.3, 'magic');
	if (hasItem(items, 'corrosion-scythe') && enabled(state, 'corrosion-scythe')) add(80, 'physical');
	if (hasItem(items, 'swift-crossbow') && enabled(state, 'swift-crossbow')) add(40, attacker.magicPower > attacker.physicalAttack ? 'magic' : 'physical');
	if (hasItem(items, 'azure-blade') && enabled(state, 'azure-blade')) add(50, 'true');
	if (hasItem(items, 'endless-battle') && enabled(state, 'endless-battle')) add(attacker.physicalAttack * 0.6, 'true');
	if (hasItem(items, 'starlium-scythe') && enabled(state, 'starlium-scythe')) add(100 + attacker.magicPower, 'true');
	if (hasItem(items, 'blade-of-the-heptaseas') && enabled(state, 'blade-of-the-heptaseas')) add(160 + attacker.physicalAttack * 0.4, 'physical');
	if (hasItem(items, 'thunder-belt') && enabled(state, 'thunder-belt')) {
		const roleFactor = heroRole === 'marksman' || heroRole === 'mage' ? 0.5 : 1;
		add((50 + attacker.physicalDefense + attacker.magicDefense) * roleFactor, 'true');
	}
	if (hasItem(items, 'windtalker') && enabled(state, 'windtalker')) {
		const t = clamp((level - 1) / 14, 0, 1);
		add(150 + (362 - 150) * t, 'magic', true);
	}
	if (hasItem(items, 'wishing-lantern') && enabled(state, 'wishing-lantern')) add(target.hp * 0.1, 'magic');
	return extra;
}
