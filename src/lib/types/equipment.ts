import type { StatBlock } from './stats';

export type ItemCategory = 'attack' | 'magic' | 'defense' | 'movement' | 'jungle' | 'roam';
export type ItemTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'ETC';

export interface CalculationAttribute {
	key: string;
	value?: number;
	min_value?: number;
	max_value?: number;
	value_type: string;
	scaling_stat?: string;
	source: string;
	trigger: string;
	condition?: string;
	target?: string;
	duration?: number;
	cooldown?: number;
	max_stacks?: number;
	cap?: number;
	note?: string;
}

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
	calculationAttributes: CalculationAttribute[];
	passiveName?: string;
	passiveDescription?: string;
}

export interface EmblemTalent {
	id: string;
	name: string;
	description: string;
	stats: Partial<StatBlock>;
}

export interface EmblemAttribute {
	label: string;
	value: string;
}

export interface Emblem {
	id: string;
	slug: string;
	name: string;
	type: string;
	icon: string;
	benefit?: string;
	description?: string;
	cooldown?: string;
	baseStats: Partial<StatBlock>;
	attributes: EmblemAttribute[];
	talents: EmblemTalent[];
}
