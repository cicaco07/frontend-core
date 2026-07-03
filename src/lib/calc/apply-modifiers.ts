import type {
	HeroModConfig,
	MultiAreaSkill,
	StackingBuff,
	StackingFlatDamage,
	ManaStackingPassive,
	ShieldModifier,
	CritStackingBuff,
	ToggleOnHitBuff,
	ToggleEnhancedBa,
	DefenseShred,
	ConsumeAllStackSkill,
	FannyPassive
} from './hero-modifiers';
import type { StatBlock } from '../types/stats';

export interface ModifierState {
	passiveStacks: number;
	targetLowHp?: boolean;
	distance?: number;
	ultUpgradeCount?: number;
	skill2DeffLevel?: number;
	skill2DeffActive?: boolean;
	shadowOfStyxActive?: boolean;
	skill2MinionDmg?: boolean;
	bloodBanquetActive?: boolean;
	fannyFlying?: boolean;
	fannyPreyMarks?: number;
	superconductorActive?: boolean;
	onlyFastActive?: boolean;
	/** Whether the enhanced BA toggle is active (Alucard, Clint, Lesley, Hilda, Natalia). */
	baEnhancedActive?: boolean;
	/** Active count of defense shred stacks (Saber, Sun, Carmilla, Harley, Hilda). */
	defenseShredStacks?: number;
}

export function emptyModifierState(): ModifierState {
	return {
		passiveStacks: 0,
		targetLowHp: false,
		distance: 0,
		ultUpgradeCount: 0,
		skill2DeffLevel: 0,
		skill2DeffActive: false,
		shadowOfStyxActive: false,
		skill2MinionDmg: false,
		bloodBanquetActive: false,
		fannyFlying: false,
		fannyPreyMarks: 0,
		superconductorActive: false,
		onlyFastActive: false,
		baEnhancedActive: false,
		defenseShredStacks: 0
	};
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
	if (mod.passive.type === 'stacking-buff') {
		const amp = passiveDamageAmp(mod.passive, state.passiveStacks);
		return baseDamage * (1 + amp);
	}
	if (mod.passive.type === 'layla-passive') {
		const distance = state.distance ?? 0;
		// 100% to 115% at 6 units distance -> +2.5% damage per unit distance
		const amp = distance * 0.025;
		return baseDamage * (1 + amp);
	}
	if (mod.passive.type === 'fanny-passive' && state.fannyFlying) {
		const amp = mod.passive.minAmp; // flying damage = min 10% bonus
		return baseDamage * (1 + amp);
	}
	if (mod.passive.type === 'eudora-passive' && state.superconductorActive) {
		return baseDamage * (1 + mod.passive.comboAmp);
	}
	return baseDamage;
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

/** Compute extra crit chance from crit-stacking-buff modifier. */
export function computeCritFromStacks(config: CritStackingBuff, stacks: number): number {
	const clamped = Math.min(Math.max(0, stacks), config.maxStacks);
	return clamped * config.perStack;
}

/**
 * Compute on-hit magic damage from toggle-on-hit-buff (e.g. Alice Blood Banquet).
 * Damage = baseDamage + magicScaling * MP + hpRatio * targetMaxHP.
 * hpRatio interpolates between minHpRatio and maxHpRatio based on level (1 to 15).
 */
export function computeOnHitBuffDamage(
	config: ToggleOnHitBuff,
	attackerStats: StatBlock,
	targetMaxHP: number,
	level: number
): number {
	const t = Math.min(Math.max(0, (level - 1) / 14), 1);
	const hpRatio = config.minHpRatio + t * (config.maxHpRatio - config.minHpRatio);
	return (
		config.baseDamage +
		config.magicScalingRatio * attackerStats.magicPower +
		hpRatio * targetMaxHP
	);
}

/**
 * Compute raw damage for enhanced basic attack.
 * Formula: baseDamage + scalingRatio × physicalAttack.
 * Does NOT apply defense reduction — caller is responsible for computeDamage().
 */
export function computeEnhancedBaRaw(
	config: ToggleEnhancedBa,
	attackerStats: StatBlock
): number {
	return config.baseDamage + config.scalingRatio * attackerStats.physicalAttack;
}

/**
 * Compute total defense reduction from defense-shred modifier.
 * Returns { physReduction, magicReduction } — subtract these from target defense.
 */
export function computeDefenseShred(
	config: DefenseShred,
	stacks: number,
	level: number
): { physReduction: number; magicReduction: number } {
	const clamped = Math.min(Math.max(0, stacks), config.maxStacks);
	let flat = config.flatPerStack ?? 0;
	if (config.flatPerStackByLevel && level >= 1 && level <= config.flatPerStackByLevel.length) {
		flat = config.flatPerStackByLevel[level - 1];
	}
	let pct = 0;
	if (config.pctPerStack) {
		// percentage shred is additive per stack
		pct = clamped * config.pctPerStack;
	}
	const isPhys = config.defenseType === 'physical' || config.defenseType === 'both';
	const isMagic = config.defenseType === 'magic' || config.defenseType === 'both';
	return {
		physReduction: isPhys ? clamped * flat : 0,
		magicReduction: isMagic ? clamped * flat : 0
	};
	// Note: percentage shred (pct) is applied differently — it's a multiplier
	// on the defense value, not a flat subtraction. Caller handles this.
	// We return the raw values; caller applies: targetDef * (1 - pct) - flatReduction
}

/**
 * Compute damage multiplier from consume-all-stack-skill (e.g. Franco Wasteland Force).
 */
export function computeConsumeAllStackAmp(
	config: ConsumeAllStackSkill,
	stacks: number
): number {
	const clamped = Math.min(Math.max(0, stacks), config.maxStacks);
	return clamped * config.perStack;
}
