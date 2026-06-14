export interface StackingBuff {
	type: 'stacking-buff';
	label: string;
	maxStacks: number;
	perStack: number;
	duration: number;
}

export interface MultiAreaSkill {
	type: 'multi-area';
	areas: { label: string; multiplier: number }[];
}

export interface HeroModConfig {
	passive?: StackingBuff;
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
	}
};

export function getHeroMod(heroSlug: string): HeroModConfig | null {
	return heroModifiers[heroSlug] ?? null;
}
