import type { PageLoad } from './$types';
import type { Hero } from '$lib/types';
import type { Item, Emblem } from '$lib/types/equipment';
import { gqlRequest } from '$lib/api/graphql';
import { THEORYCRAFTER_QUERY } from '$lib/api/queries';
import {
	mapEmblem,
	mapHero,
	mapItem,
	type BackendEmblem,
	type BackendHero,
	type BackendItem
} from '$lib/api/mappers';

interface TheorycrafterData {
	heroes: BackendHero[];
	items: BackendItem[];
	emblems: BackendEmblem[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await gqlRequest<TheorycrafterData>(THEORYCRAFTER_QUERY, undefined, fetch);
		return {
			heroes: data.heroes.map(mapHero),
			items: data.items.map(mapItem),
			emblems: data.emblems.map(mapEmblem)
		};
	} catch {
		return { heroes: [] as Hero[], items: [] as Item[], emblems: [] as Emblem[] };
	}
};
