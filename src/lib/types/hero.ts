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
}

export interface Hero {
	id: string;
	slug: string;
	name: string;
	role: HeroRole;
	imageUrl: string;
	baseStats: StatBlock;
	statsPerLevel: Partial<StatBlock>;
	skills: HeroSkill[];
}
