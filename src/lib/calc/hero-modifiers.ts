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

export interface HeroModConfig {
	passive?: StackingBuff | StackingFlatDamage | ManaStackingPassive;
	skillOverrides?: Record<string, MultiAreaSkill>;
}

export const heroModifiers: Record<string, HeroModConfig> = {
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
		}
	},
	cecilion: {
		passive: {
			type: 'mana-stacking',
			label: 'Overflowing',
			maxStacks: 99999,
			manaPerStack: 10
		}
	}
};

export function getHeroMod(heroSlug: string): HeroModConfig | null {
	return heroModifiers[heroSlug] ?? null;
}
