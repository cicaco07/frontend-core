import type { PageLoad } from './$types';
import type { Emblem } from '$lib/types/equipment';
import { gqlRequest } from '$lib/api/graphql';
import { EMBLEMS_QUERY } from '$lib/api/queries';
import { mapEmblem, type BackendEmblem } from '$lib/api/mappers';

interface EmblemsData {
	emblems: BackendEmblem[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await gqlRequest<EmblemsData>(EMBLEMS_QUERY, undefined, fetch);
		const emblems = data.emblems.map(mapEmblem);
		return { emblems };
	} catch {
		return { emblems: [] as Emblem[] };
	}
};
