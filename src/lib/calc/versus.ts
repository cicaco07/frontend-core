import type { StatBlock, DamageType } from '../types/stats';
import type { HeroSkill } from '../types/hero';
import {
	averageBasicAttack,
	basicAttackDps,
	skillBurst,
	effectiveHp,
	heroSkillDamage
} from './formulas';

export interface Combatant {
	name: string;
	level: number;
	stats: StatBlock;
	skills: HeroSkill[];
	primaryDamageType: DamageType;
}

export interface DirectionalResult {
	basicAttack: number;
	dps: number;
	burst: number;
	timeToKillSeconds: number;
}

export interface VersusResult {
	aToB: DirectionalResult;
	bToA: DirectionalResult;
	firstBloodFavors: 'a' | 'b' | 'tie';
}

function directional(attacker: Combatant, defender: Combatant): DirectionalResult {
	const basicAttack = averageBasicAttack(attacker.stats, defender.stats);
	const dps = basicAttackDps(attacker.stats, defender.stats);
	const burst = skillBurst(attacker.skills, attacker.stats, defender.stats, attacker.level);
	const ehp = effectiveHp(defender.stats, attacker.primaryDamageType);
	const timeToKillSeconds = dps > 0 ? ehp / dps : Infinity;
	return { basicAttack, dps, burst, timeToKillSeconds };
}

// Symmetric duel: compute each hero's output against the other, then decide who
// would kill first by lower time-to-kill (DPS-based, ignoring burst windows).
export function compareVersus(a: Combatant, b: Combatant): VersusResult {
	const aToB = directional(a, b);
	const bToA = directional(b, a);

	let firstBloodFavors: 'a' | 'b' | 'tie' = 'tie';
	if (aToB.timeToKillSeconds < bToA.timeToKillSeconds) firstBloodFavors = 'a';
	else if (bToA.timeToKillSeconds < aToB.timeToKillSeconds) firstBloodFavors = 'b';

	return { aToB, bToA, firstBloodFavors };
}

export function skillBreakdown(
	attacker: Combatant,
	defender: Combatant
): Array<{ name: string; damage: number; damageType: HeroSkill['damageType'] }> {
	return attacker.skills.map((skill) => ({
		name: skill.name,
		damageType: skill.damageType,
		damage: heroSkillDamage(skill, attacker.stats, defender.stats, attacker.level)
	}));
}
