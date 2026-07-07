<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const mainEmblems = $derived(data.emblems.filter((e) => e.type === 'Main Emblem'));
	const primaryTalents = $derived(data.emblems.filter((e) => e.type === 'Primary Talent'));
	const commonTalentsS1 = $derived(data.emblems.filter((e) => e.type === 'Common Talent - Section 1'));
	const commonTalentsS2 = $derived(data.emblems.filter((e) => e.type === 'Common Talent - Section 2'));

	const sections = $derived([
		{ title: 'Primary Talents', items: primaryTalents, variant: 'talent' },
		{ title: 'Common Talents Tier 1', items: commonTalentsS1, variant: 'compact' },
		{ title: 'Common Talents Tier 2', items: commonTalentsS2, variant: 'compact' }
	]);

	function clean(description: string | null | undefined) {
		return (description ?? '')
			.replace(/&amp;lt;br\s*\/?&amp;gt;/gi, '<br/>')
			.replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
			.replace(/<br\s*\/?>/gi, '<br/>');
	}
</script>

<div class="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
	<header class="overflow-hidden rounded-3xl border border-line bg-surface/70 p-6 shadow-xl shadow-black/10">
		<p class="font-display text-xs font-bold tracking-[0.22em] text-accent uppercase">Database</p>
		<div class="mt-3 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="font-display text-3xl font-bold text-ink sm:text-4xl">Emblems & Talents Database</h1>
				<p class="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">Main emblems and talents database for Mobile Legends strategy.</p>
			</div>
			<span class="rounded-full border border-line bg-bg/60 px-4 py-2 text-sm font-semibold text-ink-muted">{data.emblems.length} entries</span>
		</div>
	</header>

	{#if data.emblems.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-10 text-center">
			<p class="font-display text-xl font-bold text-ink">No emblems loaded yet</p>
			<p class="mt-2 text-sm text-ink-muted">Connect the backend API to show emblems and talents.</p>
		</div>
	{:else}
		<section>
			<div class="mb-4 flex items-center justify-between gap-4">
				<h2 class="font-display text-2xl font-bold text-ink">Main Emblems</h2>
				<p class="text-sm text-ink-muted">{mainEmblems.length} main emblems</p>
			</div>
			<ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{#each mainEmblems as emblem (emblem.id)}
					<li class="group rounded-3xl border border-line bg-surface/78 p-5 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-accent/35">
						<div class="flex items-start gap-4">
							<span class="grid size-20 shrink-0 place-items-center rounded-2xl border border-accent/20 bg-accent/10 shadow-[0_0_36px_rgb(255_134_91/0.12)]">
								{#if emblem.icon}<img src={emblem.icon} alt={emblem.name} class="size-16 object-contain" loading="lazy" />{/if}
							</span>
							<div class="min-w-0 flex-1">
								<span class="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold text-accent uppercase">{emblem.type}</span>
								<h3 class="font-display mt-2 text-lg font-bold text-ink">{emblem.name}</h3>
								{#if emblem.description}<p class="mt-2 text-sm leading-6 text-ink-muted"><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html clean(emblem.description)}</p>{/if}
							</div>
						</div>
						{#if emblem.attributes.length}
							<div class="mt-4 rounded-2xl border border-line bg-bg/45 p-3">
								<p class="mb-2 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Total attributes</p>
								<ul class="space-y-1.5 text-sm">
									{#each emblem.attributes as attr, i (i)}
										<li class="flex justify-between gap-3"><span class="text-ink-muted">{attr.label}</span>{#if attr.value}<b class="font-mono-stat text-good">{attr.value}</b>{/if}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>

		{#each sections as section (section.title)}
			{#if section.items.length}
				<section>
					<div class="mb-4 flex items-center justify-between gap-4">
						<h2 class="font-display text-2xl font-bold text-ink">{section.title}</h2>
						<p class="text-sm text-ink-muted">{section.items.length} talents</p>
					</div>
					<ul class="grid gap-3 {section.variant === 'talent' ? 'lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}">
						{#each section.items as emblem (emblem.id)}
							<li class="rounded-2xl border border-line bg-surface/76 p-4 transition hover:border-accent/35 hover:bg-surface/95">
								<div class="flex items-start gap-3">
									<span class="grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-bg/55">
										{#if emblem.icon}<img src={emblem.icon} alt={emblem.name} class="size-9 object-contain" loading="lazy" />{/if}
									</span>
									<div class="min-w-0 flex-1">
										<h3 class="font-display font-bold text-ink">{emblem.name}</h3>
										{#if emblem.benefit}<p class="mt-1 text-xs font-semibold text-accent">{emblem.benefit}</p>{/if}
										{#if emblem.description}<p class="mt-1 text-xs leading-5 text-ink-muted"><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html clean(emblem.description)}</p>{/if}
										{#if emblem.cooldown}<p class="mt-2 inline-flex rounded-full bg-bg/60 px-2 py-0.5 text-[10px] text-ink-faint">Cooldown: {emblem.cooldown}</p>{/if}
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		{/each}
	{/if}
</div>
