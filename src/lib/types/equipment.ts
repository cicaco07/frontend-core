import type { StatBlock } from './stats';

export type ItemCategory = 'attack' | 'magic' | 'defense' | 'movement' | 'jungle' | 'roam';

export interface Item {
	id: string;
	slug: string;
	name: string;
	category: ItemCategory;
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
	baseStats: Partial<StatBlock>;
	talents: EmblemTalent[];
}
