<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const mainEmblems = $derived(data.emblems.filter((e) => e.type === 'Main Emblem'));
	const primaryTalents = $derived(data.emblems.filter((e) => e.type === 'Primary Talent'));
	const commonTalentsS1 = $derived(
		data.emblems.filter((e) => e.type === 'Common Talent - Section 1')
	);
	const commonTalentsS2 = $derived(
		data.emblems.filter((e) => e.type === 'Common Talent - Section 2')
	);
</script>

<div class="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
	<div>
		<h1 class="font-display text-3xl font-bold text-ink">Emblems</h1>
		<p class="mt-1 text-sm text-ink-muted">{data.emblems.length} total entries</p>
	</div>

	{#if data.emblems.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No emblems loaded yet. Connect the backend API.
		</p>
	{:else}
		{#if mainEmblems.length}
			<section>
				<h2 class="font-display mb-4 text-xl font-bold text-ink">Main Emblems</h2>
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each mainEmblems as emblem (emblem.id)}
						<li
							class="rounded-2xl border border-line bg-surface/82 p-5 transition hover:-translate-y-1 hover:border-line-strong hover:bg-surface-2"
						>
							{#if emblem.icon}
								<img
									src={emblem.icon}
									alt={emblem.name}
									class="mx-auto mb-3 size-16 object-contain"
									loading="lazy"
								/>
							{/if}
							<h3 class="font-display text-center text-lg font-bold text-ink">{emblem.name}</h3>

							{#if emblem.attributes.length}
								<div class="mt-3">
									<p class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">
										Attributes
									</p>
									<ul class="mt-1 space-y-1 text-sm">
										{#each emblem.attributes as attr, i (i)}
											<li class="flex justify-between gap-2">
												<span class="text-ink-muted">{attr.label}</span>
												{#if attr.value}
													<span class="font-mono-stat text-ink tabular-nums">{attr.value}</span>
												{/if}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if primaryTalents.length}
			<section>
				<h2 class="font-display mb-4 text-xl font-bold text-ink">Primary Talents</h2>
				<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each primaryTalents as emblem (emblem.id)}
						<li
							class="rounded-xl border border-accent/20 bg-accent/5 p-4 transition hover:border-accent/40"
						>
							<div class="flex items-start gap-3">
								{#if emblem.icon}
									<img
										src={emblem.icon}
										alt={emblem.name}
										class="size-8 shrink-0 object-contain"
										loading="lazy"
									/>
								{/if}
								<div class="min-w-0 flex-1">
									<h3 class="font-display text-sm font-bold text-accent">{emblem.name}</h3>
									{#if emblem.benefit}
										<p class="mt-1 text-xs font-semibold text-ink">{emblem.benefit}</p>
									{/if}
									{#if emblem.description}
										<p class="mt-0.5 text-xs leading-relaxed text-ink-muted">
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html emblem.description
												.replace(/&amp;lt;br\s*\/?&amp;gt;/gi, '<br/>')
												.replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
												.replace(/<br\s*\/?>/gi, '<br/>')}
										</p>
									{/if}
									{#if emblem.cooldown}
										<p class="mt-1 text-xs text-ink-faint">{emblem.cooldown}</p>
									{/if}
									{#if emblem.attributes.length}
										<ul class="mt-2 space-y-0.5 text-xs">
											{#each emblem.attributes as attr, i (i)}
												<li class="flex justify-between gap-2">
													<span class="text-ink-muted">{attr.label}</span>
													{#if attr.value}
														<span class="font-mono-stat text-ink tabular-nums">{attr.value}</span>
													{/if}
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if commonTalentsS1.length}
			<section>
				<h2 class="font-display mb-4 text-xl font-bold text-ink">Common Talents — Tier 1</h2>
				<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{#each commonTalentsS1 as emblem (emblem.id)}
						<li
							class="rounded-xl border border-line bg-surface/82 p-4 transition hover:border-line-strong"
						>
							<div class="flex items-start gap-3">
								{#if emblem.icon}
									<img
										src={emblem.icon}
										alt={emblem.name}
										class="size-7 shrink-0 object-contain"
										loading="lazy"
									/>
								{/if}
								<div class="min-w-0 flex-1">
									<h3 class="text-sm font-semibold text-ink">{emblem.name}</h3>
									{#if emblem.benefit}
										<p class="mt-1 text-xs font-semibold text-ink">{emblem.benefit}</p>
									{/if}
									{#if emblem.description}
										<p class="mt-0.5 text-xs leading-relaxed text-ink-muted">
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html emblem.description
												.replace(/&amp;lt;br\s*\/?&amp;gt;/gi, '<br/>')
												.replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
												.replace(/<br\s*\/?>/gi, '<br/>')}
										</p>
									{/if}
									{#if emblem.attributes.length}
										<ul class="mt-2 space-y-0.5 text-xs">
											{#each emblem.attributes as attr, i (i)}
												<li class="flex justify-between gap-2">
													<span class="text-ink-muted">{attr.label}</span>
													{#if attr.value}
														<span class="font-mono-stat text-ink tabular-nums">{attr.value}</span>
													{/if}
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if commonTalentsS2.length}
			<section>
				<h2 class="font-display mb-4 text-xl font-bold text-ink">Common Talents — Tier 2</h2>
				<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{#each commonTalentsS2 as emblem (emblem.id)}
						<li
							class="rounded-xl border border-line bg-surface/82 p-4 transition hover:border-line-strong"
						>
							<div class="flex items-start gap-3">
								{#if emblem.icon}
									<img
										src={emblem.icon}
										alt={emblem.name}
										class="size-7 shrink-0 object-contain"
										loading="lazy"
									/>
								{/if}
								<div class="min-w-0 flex-1">
									<h3 class="text-sm font-semibold text-ink">{emblem.name}</h3>
									{#if emblem.benefit}
										<p class="mt-1 text-xs font-semibold text-ink">{emblem.benefit}</p>
									{/if}
									{#if emblem.description}
										<p class="mt-0.5 text-xs leading-relaxed text-ink-muted">
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html emblem.description
												.replace(/&amp;lt;br\s*\/?&amp;gt;/gi, '<br/>')
												.replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
												.replace(/<br\s*\/?>/gi, '<br/>')}
										</p>
									{/if}
									{#if emblem.attributes.length}
										<ul class="mt-2 space-y-0.5 text-xs">
											{#each emblem.attributes as attr, i (i)}
												<li class="flex justify-between gap-2">
													<span class="text-ink-muted">{attr.label}</span>
													{#if attr.value}
														<span class="font-mono-stat text-ink tabular-nums">{attr.value}</span>
													{/if}
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/if}
</div>
