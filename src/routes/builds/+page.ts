import type { PageLoad } from './$types';
import type { Build } from '$lib/types';
import { gqlRequest } from '$lib/api/graphql';
import { OFFICIAL_BUILDS_QUERY } from '$lib/api/queries';
import { mapBuild, type BackendBuild } from '$lib/api/mappers';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const result = await gqlRequest<
			{ officialBuilds: BackendBuild[] },
			{ limit: number; offset: number }
		>(OFFICIAL_BUILDS_QUERY, { limit: 30, offset: 0 }, fetch);

		const builds: Build[] = result.officialBuilds.map(mapBuild);
		return { builds };
	} catch {
		return { builds: [] as Build[] };
	}
};
