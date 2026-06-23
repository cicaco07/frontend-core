export interface StackingBuff {
	type: 'stacking-buff';
	label: string;
	maxStacks: number;
	perStack: number;
	duration: number;
}

/** Flat damage added per stack on a specific skill (e.g. Aldous Skill 1). */
export interface StackingFlatDamage {
	type: 'stacking-flat-damage';
	label: string;
	maxStacks: number;
	perStack: number;
	/** Which skill this stacking bonus applies to (matched by lowercase name). */
	skillName: string;
	/** Base damage of the enhanced attack (before scaling). */
	baseDamage: number;
	/** Scaling ratio against total physical attack. */
	scalingRatio: number;
}

/** Passive mana stacking that also scales skill damage (e.g. Cecilion). */
export interface ManaStackingPassive {
	type: 'mana-stacking';
	label: string;
	maxStacks: number;
	manaPerStack: number;
}

export interface MultiAreaSkill {
	type: 'multi-area';
	areas: { label: string; multiplier: number }[];
}

export interface ShieldModifier {
	type: 'shield';
	label: string;
	baseShield: number;
	hpScalingRatio: number;
	duration: number;
	stackScalingRatio?: number;
}

export interface HpScalingPassive {
	type: 'basic-attack-hp-scaling';
	label: string;
	baseDamage: number;
	hpScalingRatio: number;
	maxStacks: number;
}

export interface ZilongPassive {
	type: 'zilong-passive';
	label: string;
	maxStacks: number;
	perStack: number;
	duration: number;
}

export interface LaylaPassive {
	type: 'layla-passive';
	label: string;
	maxStacks: number;
	perStack: number;
	duration: number;
}

export type SkillOverride = MultiAreaSkill | ShieldModifier;

export interface HeroModConfig {
	passive?:
		| StackingBuff
		| StackingFlatDamage
		| ManaStackingPassive
		| HpScalingPassive
		| ZilongPassive
		| LaylaPassive;
	skillOverrides?: Record<string, SkillOverride>;
}

export const heroModifiers: Record<string, HeroModConfig> = {
	akai: {
		passive: {
			type: 'basic-attack-hp-scaling',
			label: 'Tai Chi (Marked)',
			baseDamage: 25,
			hpScalingRatio: 0.05,
			maxStacks: 1
		},
		skillOverrides: {
			'tai chi': {
				type: 'shield',
				label: 'Tai Chi Shield',
				baseShield: 25,
				hpScalingRatio: 0.05,
				duration: 4
			}
		}
	},
	lancelot: {
		passive: {
			type: 'stacking-buff',
			label: 'Soul Cutter',
			maxStacks: 4,
			perStack: 0.075,
			duration: 4
		},
		skillOverrides: {
			'thorned rose': {
				type: 'multi-area',
				areas: [
					{ label: 'Area 1', multiplier: 1 / 3 },
					{ label: 'Area 2', multiplier: 2 / 3 },
					{ label: 'Area 3', multiplier: 1 }
				]
			}
		}
	},
	aldous: {
		passive: {
			type: 'stacking-flat-damage',
			label: 'Soul Steal',
			maxStacks: 800,
			perStack: 5,
			skillName: 'contract: soul steal',
			baseDamage: 200,
			scalingRatio: 1.0
		},
		skillOverrides: {
			'contract: transform': {
				type: 'shield',
				label: 'Contract: Transform Shield',
				baseShield: 500,
				hpScalingRatio: 0,
				duration: 3,
				stackScalingRatio: 3
			}
		}
	},
	cecilion: {
		passive: {
			type: 'mana-stacking',
			label: 'Overflowing',
			maxStacks: 99999,
			manaPerStack: 10
		}
	},
	zilong: {
		passive: {
			type: 'zilong-passive',
			label: 'Dragon Flurry',
			maxStacks: 0,
			perStack: 0,
			duration: 0
		}
	},
	layla: {
		passive: {
			type: 'layla-passive',
			label: 'Malefic Gun',
			maxStacks: 0,
			perStack: 0,
			duration: 0
		}
	}
};

export function getHeroMod(heroSlug: string): HeroModConfig | null {
	return heroModifiers[heroSlug] ?? null;
}
