import type { PageLoad } from './$types';
import type { Item } from '$lib/types/equipment';
import { gqlRequest } from '$lib/api/graphql';
import { ITEMS_QUERY, PATCH_CHANGES_QUERY } from '$lib/api/queries';
import { mapItem, type BackendItem } from '$lib/api/mappers';
import { groupPatchChangesByTarget, mapPatchChange } from '$lib/patch-note';
import type { BackendPatchChange, PatchChange } from '$lib/types/patch-note';

interface ItemsData {
	items: BackendItem[];
}

export const load: PageLoad = async ({ fetch }) => {
	try {
		const data = await gqlRequest<ItemsData>(ITEMS_QUERY, undefined, fetch);
		const items = data.items.map(mapItem);
		let patchChangesByItem: Record<string, PatchChange[]> = {};
		try {
			const history = await gqlRequest<
				{ patchChanges: BackendPatchChange[] },
				{ filter: { targetType: 'ITEM' } }
			>(PATCH_CHANGES_QUERY, { filter: { targetType: 'ITEM' } }, fetch);
			patchChangesByItem = Object.fromEntries(
				groupPatchChangesByTarget(history.patchChanges.map(mapPatchChange))
			);
		} catch {
			patchChangesByItem = {};
		}

		return { items, patchChangesByItem };
	} catch {
		return { items: [] as Item[], patchChangesByItem: {} as Record<string, PatchChange[]> };
	}
};
