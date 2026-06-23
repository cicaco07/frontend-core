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

export interface DefReduction {
	flatDefReduction: number;
	pctDefReduction: number;
}

const NO_DEF_REDUCTION: DefReduction = { flatDefReduction: 0, pctDefReduction: 0 };

export function effectiveResistance(
	defense: number,
	penFlat: number,
	penPct: number,
	defReduction: DefReduction = NO_DEF_REDUCTION
): number {
	const afterFlatReduction = defense - defReduction.flatDefReduction;
	const afterPctReduction = afterFlatReduction * (1 - clamp01(defReduction.pctDefReduction));
	const afterPen = afterPctReduction * (1 - clamp01(penPct));
	return Math.max(-60, afterPen - penFlat);
}

export function mitigationMultiplier(effRes: number): number {
	return 120 / (120 + effRes);
}

export interface DamageInput {
	rawDamage: number;
	damageType: DamageType;
	attacker: StatBlock;
	target: StatBlock;
	bonusDmgPct?: number;
	defReduction?: DefReduction;
}

export function computeDamage(input: DamageInput): number {
	const { rawDamage, damageType, attacker, target, bonusDmgPct = 0, defReduction } = input;
	if (damageType === 'true') return Math.max(0, rawDamage * (1 + bonusDmgPct));

	const isPhysical = damageType === 'physical';
	const defense = isPhysical ? target.physicalDefense : target.magicDefense;
	const penFlat = isPhysical ? attacker.physicalPenFlat : attacker.magicPenFlat;
	const penPct = isPhysical ? attacker.physicalPenPct : attacker.magicPenPct;

	const effRes = effectiveResistance(defense, penFlat, penPct, defReduction);
	const mitigation = mitigationMultiplier(effRes);
	return Math.max(0, rawDamage * (1 + bonusDmgPct) * mitigation);
}

export function averageBasicAttack(
	attacker: StatBlock,
	target: StatBlock,
	bonusDmgPct = 0,
	defReduction?: DefReduction,
	customRawDamage?: number
): number {
	const hit = computeDamage({
		rawDamage: customRawDamage !== undefined ? customRawDamage : attacker.physicalAttack,
		damageType: 'physical',
		attacker,
		target,
		bonusDmgPct,
		defReduction
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
	baseAttackSpeed = 1,
	customRawDamage?: number
): number {
	return (
		averageBasicAttack(attacker, target, 0, undefined, customRawDamage) *
		attacksPerSecond(attacker, baseAttackSpeed)
	);
}

export function heroSkillDamage(
	skill: HeroSkill,
	attacker: StatBlock,
	target: StatBlock,
	level: number,
	bonusDmgPct = 0,
	defReduction?: DefReduction,
	bonusFlatDmg = 0
): number {
	if (skill.damageType === 'none') return 0;

	const rank = Math.min(skill.baseDamage.length - 1, Math.max(0, level - 1));
	let raw = (skill.baseDamage[rank] ?? 0) + bonusFlatDmg;
	for (const s of skill.scaling) {
		raw += attacker[s.stat] * s.ratio;
	}

	return computeDamage({
		rawDamage: raw,
		damageType: skill.damageType,
		attacker,
		target,
		bonusDmgPct,
		defReduction
	});
}

export function skillBurst(
	skills: HeroSkill[],
	attacker: StatBlock,
	target: StatBlock,
	level: number,
	bonusDmgPct = 0,
	defReduction?: DefReduction
): number {
	return skills.reduce(
		(sum, skill) =>
			sum + heroSkillDamage(skill, attacker, target, level, bonusDmgPct, defReduction),
		0
	);
}

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
