import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { HeroStat } from '$lib/types';
import { gqlRequest } from '$lib/api/graphql';
import {
	HERO_STATS_QUERY,
	TOURNAMENT_DETAIL_QUERY,
	TOURNAMENT_STAGES_QUERY,
	TOURNAMENTS_QUERY
} from '$lib/api/queries';
import {
	mapHeroStat,
	mapTournament,
	mapTournamentStage,
	type BackendHeroStat,
	type BackendTournament,
	type BackendTournamentStage
} from '$lib/api/mappers';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const listData = await gqlRequest<{ tournaments: BackendTournament[] }>(
			TOURNAMENTS_QUERY,
			undefined,
			fetch
		);
		const summary = listData.tournaments.find((tournament) => tournament.slug === params.slug);
		if (!summary) throw error(404, 'Tournament not found');

		const [detailData, stagesData] = await Promise.all([
			gqlRequest<{ tournament: BackendTournament }, { id: string }>(
				TOURNAMENT_DETAIL_QUERY,
				{ id: summary._id },
				fetch
			),
			gqlRequest<{ tournamentStages: BackendTournamentStage[] }, { tournamentId: string }>(
				TOURNAMENT_STAGES_QUERY,
				{ tournamentId: summary._id },
				fetch
			)
		]);

		const stages = stagesData.tournamentStages
			.map(mapTournamentStage)
			.sort((a, b) => a.order - b.order);
		const initialStageId = stages[0]?.id;
		let heroStats: HeroStat[] = [];

		if (initialStageId) {
			try {
				const statsData = await gqlRequest<
					{ heroStats: BackendHeroStat[] },
					Record<string, unknown>
				>(
					HERO_STATS_QUERY,
					{ tournamentId: summary._id, stageId: initialStageId, limit: 200 },
					fetch
				);
				heroStats = statsData.heroStats.map(mapHeroStat);
			} catch {
				heroStats = [];
			}
		}

		return {
			tournament: mapTournament(detailData.tournament),
			stages,
			initialStageId,
			heroStats
		};
	} catch {
		throw error(404, 'Tournament not found');
	}
};
