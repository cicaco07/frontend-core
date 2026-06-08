<script lang="ts">
	import type { PageData } from './$types';
	import { statEntries } from '$lib/utils/stats';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<div>
		<h1 class="font-display text-3xl font-bold text-ink">Emblems</h1>
		<p class="mt-1 text-sm text-ink-muted">{data.emblems.length} emblem sets</p>
	</div>

	{#if data.emblems.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No emblems loaded yet. Connect the backend API.
		</p>
	{:else}
		<ul class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each data.emblems as emblem (emblem.id)}
				<li
					class="rounded-2xl border border-line bg-surface/82 p-5 transition hover:-translate-y-1 hover:border-line-strong hover:bg-surface-2"
				>
					<h2 class="font-display text-xl font-bold text-ink">{emblem.name}</h2>

					{#if statEntries(emblem.baseStats).length}
						<div class="mt-2">
							<p class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">
								Base Stats
							</p>
							<ul class="mt-1 space-y-1 text-sm">
								{#each statEntries(emblem.baseStats) as entry (entry.key)}
									<li class="flex justify-between">
										<span class="text-ink-muted">{entry.label}</span>
										<span class="font-mono-stat text-ink tabular-nums">+{entry.display}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if emblem.talents.length}
						<div class="mt-3 border-t border-line pt-3">
							<p class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">
								Talents
							</p>
							<ul class="mt-1 space-y-2">
								{#each emblem.talents as talent (talent.id)}
									<li>
										<p class="text-sm font-medium text-accent-2">{talent.name}</p>
										<p class="text-xs leading-relaxed text-ink-muted">{talent.description}</p>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
