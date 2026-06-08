import type { PageLoad } from './$types';
import type { Item } from '$lib/types/equipment';
import { gqlRequest } from '$lib/api/graphql';
import { ITEMS_QUERY } from '$lib/api/queries';
import { mapItem, type BackendItem } from '$lib/api/mappers';

interface ItemsData {
	items: BackendItem[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await gqlRequest<ItemsData>(ITEMS_QUERY, undefined, fetch);
		const items = data.items.map(mapItem);
		return { items };
	} catch {
		return { items: [] as Item[] };
	}
};
