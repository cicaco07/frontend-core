import type { StatBlock } from './stats';

export type ItemCategory = 'attack' | 'magic' | 'defense' | 'movement' | 'jungle' | 'roam';
export type ItemTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'ETC';

export interface Item {
	id: string;
	slug: string;
	name: string;
	type: string;
	category: ItemCategory;
	tier: ItemTier;
	cost: number;
	imageUrl: string;
	stats: Partial<StatBlock>;
	passiveName?: string;
	passiveDescription?: string;
}

export interface EmblemTalent {
	id: string;
	name: string;
	description: string;
	stats: Partial<StatBlock>;
}

export interface Emblem {
	id: string;
	slug: string;
	name: string;
	type: string;
	icon: string;
	baseStats: Partial<StatBlock>;
	talents: EmblemTalent[];
}
