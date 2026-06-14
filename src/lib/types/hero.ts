import type { HeroRole, StatBlock } from './stats';

export interface SkillLevelAttributes {
	label: string;
	value: string;
}

export interface SkillLevelData {
	level: number;
	attributes: SkillLevelAttributes[];
}

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
	tags?: string[];
	rawType?: string;
	description?: string;
	imageUrl?: string;
	levelData?: SkillLevelData[];
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

export interface HeroAbilityScores {
	offense: number;
	durability: number;
	controlEffect: number;
	difficulty: number;
}

export interface Hero {
	id: string;
	slug: string;
	name: string;
	role: HeroRole;
	lanes?: string[];
	imageUrl: string;
	avatarUrl: string;
	baseStats: StatBlock;
	statsPerLevel: Partial<StatBlock>;
	skills: HeroSkill[];
	title?: string;
	lore?: string;
	specialities?: HeroSpeciality[];
	difficulty?: 1 | 2 | 3;
	abilityScores?: HeroAbilityScores;
	region?: string;
	releaseDate?: string;
	releaseYear?: number;
	relations?: HeroRelations;
}
