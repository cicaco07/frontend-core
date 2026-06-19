import type {
	HeroModConfig,
	MultiAreaSkill,
	StackingBuff,
	StackingFlatDamage,
	ManaStackingPassive,
	ShieldModifier
} from './hero-modifiers';
import type { StatBlock } from '../types/stats';

export interface ModifierState {
	passiveStacks: number;
}

export function emptyModifierState(): ModifierState {
	return { passiveStacks: 0 };
}

export function passiveDamageAmp(passive: StackingBuff, stacks: number): number {
	const clamped = Math.min(Math.max(0, stacks), passive.maxStacks);
	return clamped * passive.perStack;
}

export function applyPassiveAmp(
	baseDamage: number,
	mod: HeroModConfig | null,
	state: ModifierState
): number {
	if (!mod?.passive) return baseDamage;
	if (mod.passive.type !== 'stacking-buff') return baseDamage;
	const amp = passiveDamageAmp(mod.passive, state.passiveStacks);
	return baseDamage * (1 + amp);
}

/** Compute Aldous-style enhanced basic attack damage from Soul Steal stacks. */
export function computeStackingFlatDamage(
	config: StackingFlatDamage,
	stacks: number,
	attackerStats: StatBlock,
	customBaseDamage?: number
): number {
	const clamped = Math.min(Math.max(0, stacks), config.maxStacks);
	const base = customBaseDamage !== undefined ? customBaseDamage : config.baseDamage;
	return (
		base +
		config.scalingRatio * attackerStats.physicalAttack +
		clamped * config.perStack
	);
}

/** Extra mana from Cecilion's passive stacking. */
export function computeManaFromStacks(config: ManaStackingPassive, stacks: number): number {
	const clamped = Math.min(Math.max(0, stacks), config.maxStacks);
	return clamped * config.manaPerStack;
}

export function getSkillAreas(
	mod: HeroModConfig | null,
	skillName: string | undefined
): MultiAreaSkill['areas'] | null {
	if (!mod?.skillOverrides || !skillName) return null;
	const override = mod.skillOverrides[skillName.toLowerCase()];
	if (!override || override.type !== 'multi-area') return null;
	return override.areas;
}

export function computeMultiAreaDamage(
	baseDamage: number,
	areas: MultiAreaSkill['areas']
): { label: string; damage: number }[] {
	return areas.map((area) => ({
		label: area.label,
		damage: baseDamage * area.multiplier
	}));
}

export function getSkillShield(
	mod: HeroModConfig | null,
	skillName: string | undefined
): ShieldModifier | null {
	if (!mod?.skillOverrides || !skillName) return null;
	const override = mod.skillOverrides[skillName.toLowerCase()];
	if (!override || override.type !== 'shield') return null;
	return override;
}

export function computeShieldValue(
	shieldMod: ShieldModifier,
	attackerStats: StatBlock,
	stacks = 0
): number {
	return (
		shieldMod.baseShield +
		attackerStats.hp * shieldMod.hpScalingRatio +
		(shieldMod.stackScalingRatio ?? 0) * stacks
	);
}
