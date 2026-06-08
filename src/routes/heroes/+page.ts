import type { PageLoad } from './$types';
import type { Hero } from '$lib/types';
import { gqlRequest } from '$lib/api/graphql';
import { HERO_LIST_QUERY } from '$lib/api/queries';
import { mapHero, type BackendHero } from '$lib/api/mappers';

interface HeroesListData {
	heroes: BackendHero[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await gqlRequest<HeroesListData>(HERO_LIST_QUERY, undefined, fetch);
		const heroes = data.heroes.map(mapHero);
		return { heroes };
	} catch {
		return { heroes: [] as Hero[] };
	}
};
