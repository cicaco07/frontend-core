import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { ApiError } from './client';

interface GraphQLResponse<TData> {
	data?: TData;
	errors?: Array<{ message: string }>;
}

type Variables = Record<string, unknown>;

export async function gqlRequest<TData, TVariables extends Variables = Variables>(
	query: string,
	variables?: TVariables,
	fetchFn: typeof fetch = fetch
): Promise<TData> {
	const base = PUBLIC_API_BASE_URL ?? '';
	const endpoint = base.endsWith('/graphql') ? base : `${base}/graphql`;
	const res = await fetchFn(endpoint, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query, variables })
	});

	if (!res.ok) {
		throw new ApiError(res.status, `GraphQL request failed with ${res.status}`);
	}

	const payload = (await res.json()) as GraphQLResponse<TData>;
	if (payload.errors?.length) {
		throw new ApiError(500, payload.errors.map((error) => error.message).join('; '));
	}

	if (!payload.data) {
		throw new ApiError(500, 'GraphQL response did not include data');
	}

	return payload.data;
}
