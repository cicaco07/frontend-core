import type { HeroRole, StatBlock } from './stats';

export interface HeroSkillScaling {
	stat: 'physicalAttack' | 'magicPower' | 'hp' | 'physicalDefense' | 'magicDefense';
	ratio: number;
}

export interface HeroSkill {
	id: string;
	name: string;
	damageType: 'physical' | 'magic' | 'true' | 'none';
	baseDamage: number[];
	scaling: HeroSkillScaling[];
	skillType?: 'passive' | 'skill1' | 'skill2' | 'ultimate';
	description?: string;
}

export type HeroSpeciality =
	| 'burst'
	| 'reap'
	| 'damage'
	| 'charge'
	| 'control'
	| 'guard'
	| 'push'
	| 'poke'
	| 'regen'
	| 'chase'
	| 'finisher'
	| 'support';

export interface HeroRelation {
	slug: string;
	name: string;
	role: HeroRole;
	imageUrl: string;
	reason?: string;
}

export interface HeroRelations {
	strongAgainst: HeroRelation[];
	weakAgainst: HeroRelation[];
	synergy: HeroRelation[];
}

export interface Hero {
	id: string;
	slug: string;
	name: string;
	role: HeroRole;
	lanes?: string[];
	imageUrl: string;
	baseStats: StatBlock;
	statsPerLevel: Partial<StatBlock>;
	skills: HeroSkill[];
	title?: string;
	lore?: string;
	specialities?: HeroSpeciality[];
	difficulty?: 1 | 2 | 3;
	releaseYear?: number;
	relations?: HeroRelations;
}
