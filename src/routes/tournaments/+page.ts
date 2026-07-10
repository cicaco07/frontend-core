import type { PageLoad } from './$types';
import type { Tournament } from '$lib/types';
import { gqlRequest } from '$lib/api/graphql';
import { TOURNAMENTS_QUERY } from '$lib/api/queries';
import { mapTournament, type BackendTournament } from '$lib/api/mappers';

interface TournamentsListData {
	tournaments: BackendTournament[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await gqlRequest<TournamentsListData>(TOURNAMENTS_QUERY, undefined, fetch);
		return { tournaments: data.tournaments.map(mapTournament) };
	} catch {
		return { tournaments: [] as Tournament[] };
	}
};
