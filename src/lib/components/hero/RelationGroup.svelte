<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HeroRelation } from '$lib/types';
	import { roleColor, titleCase } from '$lib/utils/labels';

	let { title, accent, relations }: { title: string; accent: string; relations: HeroRelation[] } =
		$props();
</script>

<section class="rounded-md border border-slate-800 p-4">
	<h3 class="mb-3 flex items-center gap-2 font-semibold">
		<span class="inline-block h-2.5 w-2.5 rounded-full" style="background:{accent}"></span>
		{title}
	</h3>
	{#if relations.length === 0}
		<p class="text-sm text-slate-500">No data.</p>
	{:else}
		<ul class="space-y-2">
			{#each relations as rel (rel.slug)}
				<li>
					<a
						href={resolve('/heroes/[slug]', { slug: rel.slug })}
						class="flex items-center gap-2 rounded p-1 transition hover:bg-slate-800"
					>
						<span
							class="h-8 w-8 shrink-0 overflow-hidden rounded bg-slate-800"
							style="border-left:2px solid {roleColor(rel.role)}"
						>
							{#if rel.imageUrl}
								<img src={rel.imageUrl} alt={rel.name} class="h-full w-full object-cover" />
							{/if}
						</span>
						<span class="min-w-0">
							<span class="block truncate text-sm text-slate-100">{rel.name}</span>
							{#if rel.reason}
								<span class="block truncate text-xs text-slate-500">{rel.reason}</span>
							{:else}
								<span class="block text-xs text-slate-500 capitalize">{titleCase(rel.role)}</span>
							{/if}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
