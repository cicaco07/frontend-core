import { describe, it, expect } from 'vitest';
import { compareVersus, skillBreakdown, type Combatant } from './versus';
import { emptyStatBlock } from '../types/stats';
import type { HeroSkill } from '../types/hero';

function combatant(overrides: Partial<Combatant>): Combatant {
	return {
		name: 'X',
		level: 1,
		stats: emptyStatBlock(),
		skills: [],
		primaryDamageType: 'physical',
		...overrides
	};
}

describe('compareVersus', () => {
	it('favors the hero with lower time-to-kill', () => {
		const strong = combatant({
			name: 'Strong',
			stats: { ...emptyStatBlock(), physicalAttack: 200, hp: 3000 }
		});
		const weak = combatant({
			name: 'Weak',
			stats: { ...emptyStatBlock(), physicalAttack: 50, hp: 3000 }
		});

		const result = compareVersus(strong, weak);
		expect(result.firstBloodFavors).toBe('a');
		expect(result.aToB.timeToKillSeconds).toBeLessThan(result.bToA.timeToKillSeconds);
	});

	it('returns tie for mirror matchups', () => {
		const stats = { ...emptyStatBlock(), physicalAttack: 120, hp: 4000 };
		const result = compareVersus(
			combatant({ name: 'A', stats: { ...stats } }),
			combatant({ name: 'B', stats: { ...stats } })
		);
		expect(result.firstBloodFavors).toBe('tie');
	});

	it('higher defense extends the attacker time-to-kill', () => {
		const attacker = combatant({ stats: { ...emptyStatBlock(), physicalAttack: 150, hp: 3000 } });
		const tanky = combatant({
			stats: { ...emptyStatBlock(), physicalAttack: 150, hp: 3000, physicalDefense: 120 }
		});
		const result = compareVersus(attacker, tanky);
		expect(result.aToB.timeToKillSeconds).toBeGreaterThan(result.bToA.timeToKillSeconds);
		expect(result.firstBloodFavors).toBe('b');
	});
});

describe('skillBreakdown', () => {
	it('returns per-skill mitigated damage', () => {
		const skills: HeroSkill[] = [
			{ id: 'u', name: 'Ult', damageType: 'true', baseDamage: [500], scaling: [] }
		];
		const attacker = combatant({ skills });
		const defender = combatant({ stats: { ...emptyStatBlock(), magicDefense: 999 } });

		const breakdown = skillBreakdown(attacker, defender);
		expect(breakdown).toHaveLength(1);
		expect(breakdown[0].name).toBe('Ult');
		expect(breakdown[0].damage).toBe(500);
	});
});
