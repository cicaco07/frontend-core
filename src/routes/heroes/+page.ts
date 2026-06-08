import type { PageLoad } from './$types';
import { apiGet } from '$lib/api/client';
import type { Hero } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const heroes = await apiGet<Hero[]>('/heroes', fetch);
		return { heroes };
	} catch {
		return { heroes: [] as Hero[] };
	}
};
