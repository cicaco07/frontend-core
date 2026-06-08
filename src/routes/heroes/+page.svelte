<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
</script>

<h1 class="mb-4 text-2xl font-bold">Heroes</h1>
{#if data.heroes.length === 0}
	<p class="text-slate-400">No heroes loaded yet. Connect the backend API.</p>
{:else}
	<ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
		{#each data.heroes as hero (hero.id)}
			<li class="rounded-md border border-slate-800 p-3">
				<a href={resolve('/heroes/[slug]', { slug: hero.slug })} class="hover:text-indigo-400"
					>{hero.name}</a
				>
				<p class="text-xs text-slate-400 capitalize">{hero.role}</p>
			</li>
		{/each}
	</ul>
{/if}
