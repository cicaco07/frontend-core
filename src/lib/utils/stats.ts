import type { StatBlock } from '$lib/types';

const STAT_LABELS: Partial<Record<keyof StatBlock, string>> = {
	hp: 'HP',
	hpRegen: 'HP Regen',
	mana: 'Mana',
	manaRegen: 'Mana Regen',
	physicalAttack: 'Physical Attack',
	magicPower: 'Magic Power',
	physicalDefense: 'Physical Defense',
	magicDefense: 'Magic Defense',
	attackSpeedPct: 'Attack Speed',
	critChancePct: 'Crit Chance',
	critDamagePct: 'Crit Damage',
	cooldownReductionPct: 'Cooldown Reduction',
	lifestealPct: 'Lifesteal',
	spellVampPct: 'Spell Vamp',
	movementSpeed: 'Movement Speed',
	physicalPenFlat: 'Physical Pen',
	physicalPenPct: 'Physical Pen',
	magicPenFlat: 'Magic Pen',
	magicPenPct: 'Magic Pen'
};

export function statLabel(key: keyof StatBlock): string {
	return STAT_LABELS[key] ?? key;
}

// Fields ending in `Pct` are ratios (0.4 -> "40%"); all others render flat.
export function formatStatValue(key: keyof StatBlock, value: number): string {
	if (key.endsWith('Pct')) return `${Math.round(value * 100)}%`;
	return `${value}`;
}

export interface StatEntry {
	key: keyof StatBlock;
	label: string;
	display: string;
}

export function statEntries(stats: Partial<StatBlock>): StatEntry[] {
	return (Object.entries(stats) as Array<[keyof StatBlock, number]>)
		.filter(([, value]) => typeof value === 'number' && value !== 0)
		.map(([key, value]) => ({
			key,
			label: statLabel(key),
			display: formatStatValue(key, value)
		}));
}
