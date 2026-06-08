import { PUBLIC_API_BASE_URL } from '$env/static/public';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

type FetchLike = typeof fetch;

export async function apiGet<T>(path: string, fetchFn: FetchLike = fetch): Promise<T> {
	const base = PUBLIC_API_BASE_URL ?? '';
	const res = await fetchFn(`${base}${path}`, {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		throw new ApiError(res.status, `GET ${path} failed with ${res.status}`);
	}

	return (await res.json()) as T;
}
