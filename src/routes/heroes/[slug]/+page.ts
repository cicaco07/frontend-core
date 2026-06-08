import type { PageLoad } from './$types';
import type { Hero, HeroRelations } from '$lib/types';
import { error } from '@sveltejs/kit';
import { gqlRequest } from '$lib/api/graphql';
import { HERO_DETAIL_QUERY, HERO_LIST_QUERY } from '$lib/api/queries';
import { mapHero, type BackendHero } from '$lib/api/mappers';

const EMPTY_RELATIONS: HeroRelations = {
	strongAgainst: [],
	weakAgainst: [],
	synergy: []
};

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const list = await gqlRequest<{ heroes: BackendHero[] }>(HERO_LIST_QUERY, undefined, fetch);
		const summary = list.heroes.map(mapHero).find((item) => item.slug === params.slug);
		if (!summary) throw error(404, 'Hero not found');

		const detail = await gqlRequest<{ hero: BackendHero }, { id: string }>(
			HERO_DETAIL_QUERY,
			{ id: summary.id },
			fetch
		);
		const hero: Hero = mapHero(detail.hero);
		return { hero, relations: hero.relations ?? EMPTY_RELATIONS };
	} catch {
		throw error(404, 'Hero not found');
	}
};
