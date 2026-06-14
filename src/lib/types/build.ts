export interface BattleSpell {
	id: string;
	name: string;
	icon: string;
	description: string;
	cooldown: number;
	tag: string;
}

export interface BuildItem {
	order: number;
	id: string;
	name: string;
	imageUrl: string;
	cost: number;
}

export interface BuildEmblem {
	id: string;
	name: string;
	icon: string;
}

export interface BuildHero {
	id: string;
	name: string;
	avatarUrl: string;
	imageUrl: string;
}

export interface Build {
	id: string;
	name: string;
	description?: string;
	role: string;
	isOfficial: boolean;
	hero: BuildHero;
	items: BuildItem[];
	emblems: BuildEmblem[];
	battleSpells: BattleSpell[];
	author: string;
}
