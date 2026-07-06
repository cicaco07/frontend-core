import type { Item } from '$lib/types/equipment';
import type { DamageType, HeroRole, StatBlock } from '$lib/types/stats';
import { emptyStatBlock } from '$lib/types/stats';

export interface ItemModifierState {
	itemStacks: Record<string, number>;
	itemToggles: Record<string, boolean>;
	targetHigherExtraHp: boolean;
	targetLowHp: boolean;
	targetCurrentHpPct: number;
	selfHpPct: number;
}

export interface ItemModifierContext {
	level: number;
	heroRole?: HeroRole;
	heroSlug?: string;
	baseStats: StatBlock;
	target: StatBlock;
}

export function emptyItemModifierState(): ItemModifierState {
	return {
		itemStacks: {},
		itemToggles: {},
		targetHigherExtraHp: false,
		targetLowHp: false,
		targetCurrentHpPct: 1,
		selfHpPct: 1
	};
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const hasItem = (items: Item[], slug: string) => items.some((item) => item.slug === slug);
const stack = (state: ItemModifierState, slug: string, max: number) =>
	clamp(state.itemStacks[slug] ?? 0, 0, max);
const enabled = (state: ItemModifierState, slug: string) => state.itemToggles[slug] ?? false;
const reducedWarAxeRole = (role?: HeroRole) => role === 'marksman' || role === 'mage' || role === 'support';
const magicAdaptiveSlugs = new Set(['natan', 'kimmy', 'guinevere', 'silvanna', 'julian', 'gusion', 'karina', 'kaja', 'joy', 'esmeralda', 'harley']);
const adaptiveTarget = (role?: HeroRole, slug?: string) => {
	if (slug && magicAdaptiveSlugs.has(slug)) return 'magic';
	return role === 'mage' || role === 'support' ? 'magic' : 'physical';
};

function addAdaptive(result: StatBlock, value: number, role?: HeroRole, slug?: string) {
	result.adaptiveAttack += value;
	if (adaptiveTarget(role, slug) === 'magic') result.magicPower += value;
	else result.physicalAttack += value;
}

export function computeItemModifierStats(
	items: Item[],
	state: ItemModifierState,
	context: ItemModifierContext
): Partial<StatBlock> {
	const result = emptyStatBlock();

	if (hasItem(items, 'brute-force-breastplate')) {
		const stacks = stack(state, 'brute-force-breastplate', 6);
		addAdaptive(result, stacks * 6, context.heroRole, context.heroSlug);
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

	if (hasItem(items, 'feather-of-heaven')) {
		result.attackSpeedPct += stack(state, 'feather-of-heaven', 5) * 0.06;
	}

	if (hasItem(items, 'corrosion-scythe')) {
		result.attackSpeedPct += stack(state, 'corrosion-scythe', 5) * 0.06;
	}

	if (hasItem(items, 'swift-crossbow')) {
		result.attackSpeedPct += stack(state, 'swift-crossbow', 5) * 0.03;
	}

	if (hasItem(items, 'golden-staff')) {
		result.attackSpeedPct += context.baseStats.critChancePct;
		result.critChancePct -= context.baseStats.critChancePct;
		result.attackSpeedCapPct = Math.max(result.attackSpeedCapPct, 5);
		if (enabled(state, 'golden-staff')) result.attackSpeedPct += 0.8;
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

	if (hasItem(items, 'sky-piercer')) {
		result.executeThresholdPct += 0.04 + stack(state, 'sky-piercer', 80) * 0.001;
	}

	if (hasItem(items, 'athenas-shield') && enabled(state, 'athenas-shield')) {
		result.magicDamageReductionPct += 0.25;
	}

	if (hasItem(items, 'guardian-helmet')) {
		result.hpRegenPct += enabled(state, 'guardian-helmet') ? 0.025 : 0.005;
	}

	if (hasItem(items, 'blood-wings') && enabled(state, 'blood-wings')) {
		result.shield += 800 + context.baseStats.magicPower;
		result.movementSpeed += 30;
	}

	if (hasItem(items, 'magic-blade') && enabled(state, 'magic-blade')) {
		result.shield += 60 * context.level;
		result.movementSpeedPct += 0.5;
	}

	if (hasItem(items, 'immortality') && enabled(state, 'immortality')) {
		const t = clamp((context.level - 1) / 14, 0, 1);
		result.reviveAvailable = 1;
		result.shield += 220 + (1200 - 220) * t;
	}

	if (hasItem(items, 'queens-wings') && enabled(state, 'queens-wings')) {
		result.damageReductionPct += 0.3;
	}

	if (hasItem(items, 'dominance-ice') && enabled(state, 'dominance-ice')) {
		result.enemyAttackSpeedReductionPct += 0.2;
		result.enemyShieldRegenReductionPct += 0.5;
	}

	if (hasItem(items, 'antique-cuirass')) {
		result.enemyPhysicalDamageReductionPct += stack(state, 'antique-cuirass', 3) * 0.06;
	}

	if (hasItem(items, 'dreadnaught-armor')) {
		result.enemyPhysicalAttackReductionPct += stack(state, 'dreadnaught-armor', 3) * 0.04;
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
	const targetCurrentHp = target.hp * clamp(state.targetCurrentHpPct, 0.01, 1);
	const attackEffectMultiplier = hasItem(items, 'golden-staff') && enabled(state, 'golden-staff') ? 3 : 1;
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
	const addAttackEffect = (rawDamage: number, damageType: DamageType) => add(rawDamage * attackEffectMultiplier, damageType);

	if (hasItem(items, 'demon-hunter-sword') && enabled(state, 'demon-hunter-sword')) addAttackEffect(targetCurrentHp * 0.08, 'physical');
	if (hasItem(items, 'feather-of-heaven') && enabled(state, 'feather-of-heaven')) addAttackEffect(50 + attacker.magicPower * 0.3, 'magic');
	if (hasItem(items, 'corrosion-scythe') && enabled(state, 'corrosion-scythe')) addAttackEffect(80, 'physical');
	if (hasItem(items, 'swift-crossbow') && enabled(state, 'swift-crossbow')) addAttackEffect(40, attacker.magicPower > attacker.physicalAttack ? 'magic' : 'physical');
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
	if (hasItem(items, 'wishing-lantern') && enabled(state, 'wishing-lantern')) add(targetCurrentHp * 0.1, 'magic');
	return extra;
}
