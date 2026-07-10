import { describe, expect, it } from 'vitest';
import { parseStatStrings } from './mappers';

describe('parseStatStrings', () => {
	it('keeps adaptive attack separate until loadout bonuses are resolved', () => {
		const stats = parseStatStrings(['Adaptive Attack +16']);

		expect(stats.adaptiveAttack).toBe(16);
		expect(stats.physicalAttack).toBeUndefined();
		expect(stats.magicPower).toBeUndefined();
	});
});
