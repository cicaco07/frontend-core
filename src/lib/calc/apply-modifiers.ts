import type { HeroModConfig, MultiAreaSkill, StackingBuff } from './hero-modifiers';

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
	const amp = passiveDamageAmp(mod.passive, state.passiveStacks);
	return baseDamage * (1 + amp);
}

export function getSkillAreas(
	mod: HeroModConfig | null,
	skillName: string | undefined
): MultiAreaSkill['areas'] | null {
	if (!mod?.skillOverrides || !skillName) return null;
	const override = mod.skillOverrides[skillName.toLowerCase()];
	if (!override) return null;
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
