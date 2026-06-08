import type { PageLoad } from './$types';
import { apiGet } from '$lib/api/client';
import type { Hero } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const hero = await apiGet<Hero>(`/heroes/${params.slug}`, fetch);
		return { hero };
	} catch {
		throw error(404, 'Hero not found');
	}
};
