import { describe, expect, it } from 'vitest';
import { mapTournament, parseStatStrings } from './mappers';

describe('parseStatStrings', () => {
	it('keeps adaptive attack separate until loadout bonuses are resolved', () => {
		const stats = parseStatStrings(['Adaptive Attack +16']);

		expect(stats.adaptiveAttack).toBe(16);
		expect(stats.physicalAttack).toBeUndefined();
		expect(stats.magicPower).toBeUndefined();
	});
});

describe('mapTournament', () => {
	it('maps GraphQL tournament fields to the frontend contract', () => {
		const tournament = mapTournament({
			_id: 'tournament-1',
			name: 'M7 World Championship',
			slug: 'm7-world-championship',
			tier: 'INTERNATIONAL',
			tierLevel: 1,
			game: 'mobile-legends',
			region: 'Global',
			logoUrl: 'https://example.com/m7.png',
			prizePool: '$1,000,000',
			startDate: '2026-01-03T00:00:00.000Z',
			endDate: '2026-01-25T00:00:00.000Z',
			liquipediaUrl: 'https://liquipedia.net/mobilelegends/M7_World_Championship',
			liquipediaSlug: 'M7_World_Championship',
			status: 'UPCOMING'
		});

		expect(tournament).toEqual({
			id: 'tournament-1',
			name: 'M7 World Championship',
			slug: 'm7-world-championship',
			tier: 'international',
			tierLevel: 1,
			game: 'mobile-legends',
			region: 'Global',
			logoUrl: 'https://example.com/m7.png',
			prizePool: '$1,000,000',
			startDate: '2026-01-03T00:00:00.000Z',
			endDate: '2026-01-25T00:00:00.000Z',
			liquipediaUrl: 'https://liquipedia.net/mobilelegends/M7_World_Championship',
			status: 'upcoming'
		});
	});

	it('normalizes nullable optional tournament fields', () => {
		const tournament = mapTournament({
			_id: 'tournament-2',
			name: 'Regional Cup',
			slug: 'regional-cup',
			tier: 'REGIONAL',
			tierLevel: 3,
			game: 'mobile-legends',
			region: null,
			logoUrl: null,
			prizePool: null,
			startDate: null,
			endDate: null,
			liquipediaUrl: 'https://liquipedia.net/mobilelegends/Regional_Cup',
			liquipediaSlug: 'Regional_Cup',
			status: 'COMPLETED'
		});

		expect(tournament.region).toBeUndefined();
		expect(tournament.logoUrl).toBeUndefined();
		expect(tournament.prizePool).toBeUndefined();
		expect(tournament.startDate).toBeUndefined();
		expect(tournament.endDate).toBeUndefined();
	});
});
