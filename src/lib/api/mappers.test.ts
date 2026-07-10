import { describe, expect, it } from 'vitest';
import {
	applyMasterHeroAvatars,
	mapHeroStat,
	mapTournament,
	mapTournamentStage,
	parseStatStrings
} from './mappers';

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

describe('tournament detail mappers', () => {
	it('maps a stage and preserves its display order', () => {
		expect(
			mapTournamentStage({
				_id: 'stage-1',
				tournamentId: 'tournament-1',
				name: 'Knockout Stage',
				slug: 'knockout-stage',
				liquipediaUrl: 'https://liquipedia.net/mobilelegends/M7/Knockout_Stage',
				order: 2
			})
		).toEqual({
			id: 'stage-1',
			name: 'Knockout Stage',
			slug: 'knockout-stage',
			liquipediaUrl: 'https://liquipedia.net/mobilelegends/M7/Knockout_Stage',
			order: 2
		});
	});

	it('maps hero statistics including rates and side splits', () => {
		expect(
			mapHeroStat({
				_id: 'stat-1',
				tournamentId: 'tournament-1',
				stageId: 'stage-1',
				heroName: 'Miya',
				heroSlug: 'miya',
				heroImageUrl: null,
				role: 'Gold Lane',
				picks: 12,
				bans: 8,
				picksAndBans: 20,
				wins: 7,
				losses: 5,
				winRate: 58.33,
				pickRate: 40,
				banRate: 26.67,
				presenceRate: 66.67,
				blueSidePicks: 7,
				blueSideWins: 4,
				redSidePicks: 5,
				redSideWins: 3
			})
		).toEqual({
			id: 'stat-1',
			stageId: 'stage-1',
			heroName: 'Miya',
			heroSlug: 'miya',
			heroImageUrl: undefined,
			role: 'Gold Lane',
			picks: 12,
			bans: 8,
			picksAndBans: 20,
			wins: 7,
			losses: 5,
			winRate: 58.33,
			pickRate: 40,
			banRate: 26.67,
			presenceRate: 66.67,
			blueSidePicks: 7,
			blueSideWins: 4,
			redSidePicks: 5,
			redSideWins: 3
		});
	});

	it('uses the master hero avatar instead of the tournament image source', () => {
		const stat = mapHeroStat({
			_id: 'stat-1',
			tournamentId: 'tournament-1',
			heroName: 'Yi Sun-shin',
			heroSlug: 'yi-sun-shin',
			heroImageUrl: 'https://liquipedia.net/yi-sun-shin.png',
			picks: 1,
			bans: 2,
			picksAndBans: 3,
			wins: 1,
			losses: 0,
			winRate: 100,
			pickRate: 10,
			banRate: 20,
			presenceRate: 30,
			blueSidePicks: 1,
			blueSideWins: 1,
			redSidePicks: 0,
			redSideWins: 0
		});

		expect(
			applyMasterHeroAvatars([stat], {
				'yi-sun-shin': 'https://api.example.com/heroes/yi-sun-shin-avatar.png'
			})[0]?.heroImageUrl
		).toBe('https://api.example.com/heroes/yi-sun-shin-avatar.png');
	});
});
