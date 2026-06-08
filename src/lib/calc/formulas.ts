import type { DamageType, StatBlock } from '../types/stats';
import { emptyStatBlock } from '../types/stats';
import type { HeroSkill } from '../types/hero';

export function sumStats(blocks: Array<Partial<StatBlock>>): StatBlock {
	const total = emptyStatBlock();
	for (const block of blocks) {
		for (const key in block) {
			const k = key as keyof StatBlock;
			const value = block[k];
			if (typeof value === 'number') total[k] += value;
		}
	}
	return total;
}

export function scaleStatsByLevel(
	base: StatBlock,
	perLevel: Partial<StatBlock>,
	level: number
): StatBlock {
	const growth = Math.max(0, level - 1);
	const result = { ...base };
	for (const key in perLevel) {
		const k = key as keyof StatBlock;
		const value = perLevel[k];
		if (typeof value === 'number') result[k] += value * growth;
	}
	return result;
}

// Effective resistance after flat pen is subtracted, then percentage pen applied.
// Order matters: ML applies flat reduction before percentage reduction.
export function effectiveResistance(resistance: number, penFlat: number, penPct: number): number {
	const afterPct = resistance * (1 - clamp01(penPct));
	return Math.max(0, afterPct - penFlat);
}

// MLBB mitigation curve: damage multiplier = 120 / (120 + effectiveResistance).
// True damage ignores resistance entirely.
export function mitigationMultiplier(effRes: number): number {
	return 120 / (120 + Math.max(0, effRes));
}

export interface DamageInput {
	rawDamage: number;
	damageType: DamageType;
	attacker: StatBlock;
	target: StatBlock;
}

export function computeDamage(input: DamageInput): number {
	const { rawDamage, damageType, attacker, target } = input;
	if (damageType === 'true') return Math.max(0, rawDamage);

	const isPhysical = damageType === 'physical';
	const resistance = isPhysical ? target.physicalDefense : target.magicDefense;
	const penFlat = isPhysical ? attacker.physicalPenFlat : attacker.magicPenFlat;
	const penPct = isPhysical ? attacker.physicalPenPct : attacker.magicPenPct;

	const effRes = effectiveResistance(resistance, penFlat, penPct);
	return Math.max(0, rawDamage * mitigationMultiplier(effRes));
}

// Average basic-attack damage accounting for crit chance and crit damage bonus.
// Default crit multiplier in MLBB is 2.0x, increased by critDamagePct.
export function averageBasicAttack(attacker: StatBlock, target: StatBlock): number {
	const hit = computeDamage({
		rawDamage: attacker.physicalAttack,
		damageType: 'physical',
		attacker,
		target
	});
	const critMultiplier = 2 + attacker.critDamagePct;
	const chance = clamp01(attacker.critChancePct);
	return hit * (1 - chance) + hit * critMultiplier * chance;
}

export function attacksPerSecond(attacker: StatBlock, baseAttackSpeed = 1): number {
	return baseAttackSpeed * (1 + attacker.attackSpeedPct);
}

export function basicAttackDps(
	attacker: StatBlock,
	target: StatBlock,
	baseAttackSpeed = 1
): number {
	return averageBasicAttack(attacker, target) * attacksPerSecond(attacker, baseAttackSpeed);
}

// Raw = base damage at the skill's rank (capped to its array) + stat scaling.
export function heroSkillDamage(
	skill: HeroSkill,
	attacker: StatBlock,
	target: StatBlock,
	level: number
): number {
	if (skill.damageType === 'none') return 0;

	const rank = Math.min(skill.baseDamage.length - 1, Math.max(0, level - 1));
	let raw = skill.baseDamage[rank] ?? 0;
	for (const s of skill.scaling) {
		raw += attacker[s.stat] * s.ratio;
	}

	return computeDamage({ rawDamage: raw, damageType: skill.damageType, attacker, target });
}

export function skillBurst(
	skills: HeroSkill[],
	attacker: StatBlock,
	target: StatBlock,
	level: number
): number {
	return skills.reduce((sum, skill) => sum + heroSkillDamage(skill, attacker, target, level), 0);
}

// Effective HP against a damage type: hp / mitigationMultiplier(resistance).
// True damage bypasses mitigation, so EHP = raw hp.
export function effectiveHp(target: StatBlock, against: DamageType): number {
	if (against === 'true') return target.hp;
	const res = against === 'physical' ? target.physicalDefense : target.magicDefense;
	return target.hp / mitigationMultiplier(res);
}

function clamp01(value: number): number {
	if (value < 0) return 0;
	if (value > 1) return 1;
	return value;
}
