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

export interface HelcurtPassive {
	type: 'helcurt-passive';
	label: string;
	maxStacks: number;
	perStack: number;
	duration: number;
}

/** Crit chance stacking on skill hits (e.g. Bruno Mecha Legs). */
export interface CritStackingBuff {
	type: 'crit-stacking-buff';
	label: string;
	maxStacks: number;
	perStack: number;
}

/** On-hit buff toggle: adds extra damage per attack when active (e.g. Alice Blood Banquet). */
export interface ToggleOnHitBuff {
	type: 'toggle-on-hit-buff';
	label: string;
	/** Base magic damage added per hit */
	baseDamage: number;
	/** Scaling ratio against total magic power */
	magicScalingRatio: number;
	/** HP ratio at level 1 */
	minHpRatio: number;
	/** HP ratio at max level */
	maxHpRatio: number;
}

/** Skill that applies a multiplier to the on-hit buff damage when active. */
export interface SkillOnHitMultiplier {
	type: 'skill-on-hit-multiplier';
	label: string;
	/** Multiplier applied to the on-hit buff base damage */
	multiplier: number;
}

/** Fanny Air Superiority: flying damage amp + Prey Mark stacks on Ultimate. */
export interface FannyPassive {
	type: 'fanny-passive';
	label: string;
	/** Min damage amp (ratio) when flying slow */
	minAmp: number;
	/** Max damage amp (ratio) when flying fast */
	maxAmp: number;
	/** Max Prey Mark stacks */
	maxPreyMarks: number;
	/** Bonus damage per Prey Mark on Ultimate */
	preyMarkDamagePct: number;
}

/** Eudora Superconductor: toggle full combo (stun → shred → lightning chain). */
export interface EudoraPassive {
	type: 'eudora-passive';
	label: string;
	/** Bonus damage ratio when Superconductor is active (e.g. 0.3 = 30%) */
	comboAmp: number;
}

/** Toggle basic attack multiplier + optional no-crit (e.g. Chou Only Fast). */
export interface ToggleBasicAtkMultiplier {
	type: 'toggle-basic-atk-multiplier';
	label: string;
	/** Multiplier on basic attack damage when active */
	multiplier: number;
	/** If true, basic attacks cannot crit when active */
	noCrit?: boolean;
}

/**
 * Enhanced Basic Attack toggle — replaces normal BA formula with
 * baseDamage + scalingRatio × PATK when active.
 * Used by heroes whose passive/skill transforms their next BA
 * (e.g. Alucard Pursuit, Clint Double Shot, Lesley Lethal Shot).
 */
export interface ToggleEnhancedBa {
	type: 'toggle-enhanced-ba';
	label: string;
	/** Flat base damage */
	baseDamage: number;
	/** Scaling ratio against total physical attack (e.g. 1.25 = 125% PATK) */
	scalingRatio: number;
	/** Damage type (default: 'physical') */
	damageType?: 'physical' | 'magic' | 'true';
	/** Can this enhanced BA crit? (default: true) */
	canCrit?: boolean;
	/** Bonus damage multiplier vs Creep (e.g. 0.1 = +10%) */
	creepBonus?: number;
}

/**
 * Defense Shred — each stack reduces target defense.
 * Supports flat reduction (e.g. Saber -3~8 PhysDef) and percentage
 * reduction (e.g. Sun -5% PhysDef), or both simultaneously.
 * `flatPerStackByLevel` is indexed by level (index 0 = level 1).
 */
export interface DefenseShred {
	type: 'defense-shred';
	label: string;
	maxStacks: number;
	flatPerStack?: number;
	flatPerStackByLevel?: number[];
	pctPerStack?: number;
	defenseType: 'physical' | 'magic' | 'both';
}

/**
 * Consume All Stack on Skill — build stacks then consume all at once
 * on next skill cast for a damage multiplier (e.g. Franco Wasteland Force).
 * Different from stacking-buff because stacks are consumed, not persistent.
 */
export interface ConsumeAllStackSkill {
	type: 'consume-all-stack-skill';
	label: string;
	maxStacks: number;
	perStack: number;
}

export type SkillOverride = MultiAreaSkill | ShieldModifier | SkillOnHitMultiplier;

export interface HeroModConfig {
	passive?:
		| StackingBuff
		| StackingFlatDamage
		| ManaStackingPassive
		| HpScalingPassive
		| ZilongPassive
		| LaylaPassive
		| HelcurtPassive
		| CritStackingBuff
		| ToggleOnHitBuff
		| FannyPassive
		| EudoraPassive
		| ToggleBasicAtkMultiplier
		| ToggleEnhancedBa
		| DefenseShred
		| ConsumeAllStackSkill;
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
	},
	helcurt: {
		passive: {
			type: 'helcurt-passive',
			label: 'Race Advantage',
			maxStacks: 0,
			perStack: 0,
			duration: 0
		},
		skillOverrides: {
			'deadly stinger': {
				type: 'multi-area',
				areas: [
					{ label: 'Stinger 1', multiplier: 1 },
					{ label: 'Stinger 2', multiplier: 2 },
					{ label: 'Stinger 3', multiplier: 3 },
					{ label: 'Stinger 4', multiplier: 4 },
					{ label: 'Stinger 5', multiplier: 5 }
				]
			}
		}
	},
	bruno: {
		passive: {
			type: 'crit-stacking-buff',
			label: 'Mecha Legs',
			maxStacks: 8,
			perStack: 0.025
		}
	},
	alice: {
		passive: {
			type: 'toggle-on-hit-buff',
			label: 'Blood Banquet',
			baseDamage: 25,
			magicScalingRatio: 0.3,
			minHpRatio: 0.005,
			maxHpRatio: 0.025
		},
		skillOverrides: {
			'doom waltz': {
				type: 'skill-on-hit-multiplier',
				label: 'Doom Waltz (Blood Banquet bonus)',
				multiplier: 3
			}
		}
	},
	fanny: {
		passive: {
			type: 'fanny-passive',
			label: 'Air Superiority',
			minAmp: 0.1,
			maxAmp: 0.2,
			maxPreyMarks: 2,
			preyMarkDamagePct: 0.3
		}
	},
	eudora: {
		passive: {
			type: 'eudora-passive',
			label: 'Superconductor',
			comboAmp: 0.3
		}
	},
	chou: {
		passive: {
			type: 'toggle-basic-atk-multiplier',
			label: 'Only Fast (180% DMG, no crit)',
			multiplier: 1.8,
			noCrit: true
		},
		skillOverrides: {
			'shunpo': {
				type: 'shield',
				label: 'Shunpo Shield',
				baseShield: 350,
				hpScalingRatio: 0,
				duration: 5
			},
			'jeet kune do': {
				type: 'multi-area',
				areas: [
					{ label: 'Kick 1', multiplier: 1 },
					{ label: 'Kick 2', multiplier: 2 },
					{ label: 'Kick 3 (Airborne)', multiplier: 3 }
				]
			},
			'the way of dragon': {
				type: 'multi-area',
				areas: [
					{ label: 'Dragon Kick', multiplier: 1 },
					{ label: 'Dragon Kick + Chase', multiplier: 2 }
				]
			}
		}
	},
	miya: {
		passive: {
			type: 'stacking-buff',
			label: 'Moon Blessing',
			maxStacks: 5,
			perStack: 0.05,
			duration: 4
		}
	},
	hayabusa: {
		passive: {
			type: 'stacking-buff',
			label: 'Ninjutsu: Passive',
			maxStacks: 5,
			perStack: 0.03,
			duration: 5
		}
	},
	jawhead: {
		passive: {
			type: 'stacking-buff',
			label: 'Mecha Suppression',
			maxStacks: 6,
			perStack: 0.08,
			duration: 2.5
		}
	},
	barats: {
		passive: {
			type: 'stacking-buff',
			label: 'Big Guy',
			maxStacks: 25,
			perStack: 0.03,
			duration: 5
		}
	},
	yve: {
		passive: {
			type: 'stacking-buff',
			label: 'Galactic Power',
			maxStacks: 10,
			perStack: 0.01,
			duration: 6
		}
	}
};

export function getHeroMod(heroSlug: string): HeroModConfig | null {
	return heroModifiers[heroSlug] ?? null;
}
