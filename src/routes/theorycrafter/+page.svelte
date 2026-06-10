<script lang="ts">
	import type { PageData } from './$types';
	import { loadout } from '$lib/stores/loadout.svelte';
	import { resolve } from '$app/paths';
	import { roleColor, titleCase } from '$lib/utils/labels';
	import type { Item } from '$lib/types/equipment';

	let { data }: { data: PageData } = $props();

	let dragItem = $state<Item | null>(null);
	let searchQuery = $state('');

	const filteredItems = $derived(
		searchQuery.trim()
			? data.items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: data.items
	);

	const mainEmblems = $derived(data.emblems.filter((e) => e.type === 'Main Emblem'));
	const primaryTalents = $derived(data.emblems.filter((e) => e.type === 'Primary Talent'));
	const commonTalentsS1 = $derived(
		data.emblems.filter((e) => e.type === 'Common Talent - Section 1')
	);
	const commonTalentsS2 = $derived(
		data.emblems.filter((e) => e.type === 'Common Talent - Section 2')
	);

	function selectHero(slug: string) {
		loadout.hero = data.heroes.find((h) => h.slug === slug) ?? null;
	}

	function onDragStart(item: Item) {
		dragItem = item;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		if (!dragItem) return;
		loadout.addItem(dragItem);
		dragItem = null;
	}

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}

	const stats = $derived(loadout.finalStats);

	const statRows = $derived([
		{ label: 'HP', value: stats.hp, color: '#5fb38a' },
		{ label: 'Mana', value: stats.mana, color: '#5aa6c4' },
		{ label: 'Phys ATK', value: stats.physicalAttack, color: '#ffb86b' },
		{ label: 'Magic Power', value: stats.magicPower, color: '#89e0eb' },
		{ label: 'Phys DEF', value: stats.physicalDefense, color: '#c2724a' },
		{ label: 'Magic DEF', value: stats.magicDefense, color: '#b25c8f' },
		{ label: 'Move SPD', value: stats.movementSpeed, color: '#c9a24a' },
		{ label: 'ATK SPD', value: stats.attackSpeedPct * 100, color: '#ffb86b', suffix: '%' },
		{ label: 'Crit Chance', value: stats.critChancePct * 100, color: '#f4f7ff', suffix: '%' },
		{ label: 'Lifesteal', value: stats.lifestealPct * 100, color: '#ff7a7c', suffix: '%' }
	]);
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="font-display text-3xl font-bold text-ink">Kalkulator Damage</h1>
			<p class="mt-1 text-sm text-ink-muted">
				Hitung damage, DPS, dan output build secara real-time.
			</p>
		</div>
		<a
			href={resolve('/theorycrafter/versus')}
			class="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-bg"
		>
			Versus mode →
		</a>
	</div>

	<div class="grid gap-6 lg:grid-cols-[280px_1fr_200px]">
		<section class="space-y-4 rounded-2xl border border-line bg-surface/82 p-4">
			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<select
					onchange={(e) => selectHero((e.target as HTMLSelectElement).value)}
					value={loadout.hero?.slug ?? ''}
					class="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
				>
					<option value="">Select hero…</option>
					{#each data.heroes as hero (hero.id)}
						<option value={hero.slug}>{hero.name}</option>
					{/each}
				</select>
			</label>

			{#if loadout.hero}
				<div class="space-y-2">
					<p class="flex items-center gap-2 text-sm" style="color:{roleColor(loadout.hero.role)}">
						<span
							class="inline-block h-2 w-2 rounded-full"
							style="background:{roleColor(loadout.hero.role)}"
						></span>
						{titleCase(loadout.hero.role)}
					</p>
					{#if loadout.hero.lanes && loadout.hero.lanes.length}
						<p class="text-xs text-ink-muted">Lane: {loadout.hero.lanes.join(' · ')}</p>
					{/if}
					{#if loadout.hero.specialities && loadout.hero.specialities.length}
						<div class="flex flex-wrap gap-1">
							{#each loadout.hero.specialities as spec (spec)}
								<span class="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-muted"
									>{titleCase(spec)}</span
								>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					<select
						onchange={(e) => {
							const slug = (e.target as HTMLSelectElement).value;
							loadout.emblem = data.emblems.find((e) => e.slug === slug) ?? null;
						}}
						class="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<option value="">Main Emblem…</option>
						{#each mainEmblems as em (em.id)}
							<option value={em.slug}>{em.name.replace('Custom ', '').replace('Basic ', '')}</option
							>
						{/each}
					</select>
					<select
						onchange={(e) => {
							const slug = (e.target as HTMLSelectElement).value;
							loadout.emblem = data.emblems.find((e) => e.slug === slug) ?? null;
						}}
						class="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<option value="">Primary Talent…</option>
						{#each primaryTalents as em (em.id)}
							<option value={em.slug}>{em.name}</option>
						{/each}
					</select>
					<select
						onchange={(e) => {
							const slug = (e.target as HTMLSelectElement).value;
							loadout.emblem = data.emblems.find((e) => e.slug === slug) ?? null;
						}}
						class="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<option value="">Tier 1 Talent…</option>
						{#each commonTalentsS1 as em (em.id)}
							<option value={em.slug}>{em.name}</option>
						{/each}
					</select>
					<select
						onchange={(e) => {
							const slug = (e.target as HTMLSelectElement).value;
							loadout.emblem = data.emblems.find((e) => e.slug === slug) ?? null;
						}}
						class="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<option value="">Tier 2 Talent…</option>
						{#each commonTalentsS2 as em (em.id)}
							<option value={em.slug}>{em.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</section>

		<section
			class="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/60 p-6"
		>
			<div class="mb-4 size-36 overflow-hidden rounded-full border-2 border-accent/40 bg-accent/10">
				{#if loadout.hero?.imageUrl}
					<img
						src={loadout.hero.imageUrl}
						alt={loadout.hero.name}
						class="h-full w-full object-cover"
					/>
				{/if}
			</div>
			<h2 class="font-display text-2xl font-bold text-ink">
				{loadout.hero?.name ?? 'Pilih Hero'}
			</h2>
			<p class="mt-1 text-xs text-ink-muted">Level {loadout.level}</p>

			<div class="mt-6 w-full max-w-sm space-y-1.5">
				{#each statRows as row (row.label)}
					<div class="flex items-center justify-between text-sm">
						<span class="text-ink-muted">{row.label}</span>
						<div class="flex items-center gap-2">
							<div class="h-1.5 w-20 overflow-hidden rounded bg-surface-3">
								<div
									class="h-full rounded"
									style="width:{Math.min(
										100,
										Math.max(2, (row.value / 10000) * 100)
									)}%;background:{row.color}"
								></div>
							</div>
							<span class="font-mono-stat w-16 text-right text-ink tabular-nums"
								>{round(row.value)}{row.suffix ?? ''}</span
							>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 w-full max-w-sm border-t border-line pt-4">
				<div class="grid grid-cols-3 gap-2 text-center">
					<div>
						<p class="text-xs text-ink-muted">Avg BA</p>
						<p class="font-mono-stat text-sm text-ink">{round(loadout.basicAttackDamage)}</p>
					</div>
					<div>
						<p class="text-xs text-ink-muted">DPS</p>
						<p class="font-mono-stat text-sm text-accent">{round(loadout.dps)}</p>
					</div>
					<div>
						<p class="text-xs text-ink-muted">EHP Phys</p>
						<p class="font-mono-stat text-sm text-ink">
							{round(stats.hp / (120 / (120 + Math.max(0, stats.physicalDefense))))}
						</p>
					</div>
				</div>
			</div>
		</section>

		<section class="rounded-2xl border border-line bg-surface/82 p-4">
			<div class="mb-3 flex items-center justify-between">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Level</span
				>
				<span class="font-display text-lg font-bold text-accent">{loadout.level}</span>
			</div>
			<input
				type="range"
				min="1"
				max="15"
				bind:value={loadout.level}
				class="w-full accent-accent"
			/>
			<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
				<span>1</span>
				<span>15</span>
			</div>

			{#if loadout.hero}
				<div class="mt-4 space-y-2 border-t border-line pt-4">
					<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
						>Skills</span
					>
					{#each loadout.hero.skills as skill (skill.id)}
						<div class="rounded-lg border border-line bg-bg/50 px-3 py-2">
							<div class="flex items-center justify-between">
								<span class="text-xs font-medium text-ink">{skill.name}</span>
								<span class="font-mono-stat text-xs text-accent"
									>{round(loadout.skillDamage(skill.id))}</span
								>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-2xl border border-line bg-surface/82 p-4">
			<div class="mb-3 flex items-center justify-between">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Items ({loadout.items.length}/6)</span
				>
				<input
					type="search"
					placeholder="Search item…"
					bind:value={searchQuery}
					class="w-48 rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
				/>
			</div>

			<div class="mb-4 grid grid-cols-6 gap-2" role="list">
				{#each Array(6) as _, i (i)}
					{@const item = loadout.items[i]}
					<div
						class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
						class:border-accent-40={item}
						class:border-line={!item}
						class:bg-surface-3={item}
						role="listitem"
						ondragover={onDragOver}
						ondrop={onDrop}
					>
						{#if item}
							{#if item.imageUrl}
								<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
							{:else}
								<span class="px-1 text-center text-[10px] text-ink-muted">{item.name}</span>
							{/if}
							<button
								type="button"
								onclick={() => loadout.removeItem(i)}
								class="absolute top-0 right-0 flex size-5 items-center justify-center rounded-bl bg-red-500/80 text-xs text-white hover:bg-red-500"
							>
								×
							</button>
						{:else}
							<span class="text-xs text-ink-faint">+</span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="max-h-64 overflow-y-auto">
				<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
					{#each filteredItems as item (item.id)}
						<button
							type="button"
							draggable="true"
							ondragstart={() => onDragStart(item)}
							onclick={() => loadout.addItem(item)}
							class="flex items-center gap-2 rounded-lg border border-line bg-bg/50 px-2 py-1.5 text-left text-xs transition hover:border-accent/40 hover:bg-surface-2"
						>
							<span class="size-7 shrink-0 overflow-hidden rounded bg-surface-3">
								{#if item.imageUrl}
									<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
								{/if}
							</span>
							<span class="truncate text-ink">{item.name}</span>
						</button>
					{/each}
				</div>
			</div>
		</section>

		<section class="rounded-2xl border border-line bg-surface/82 p-4">
			<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
				>Item Stats</span
			>
			<div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
				{#each [{ label: 'Physical Attack', value: loadout.itemStats.physicalAttack }, { label: 'Magic Power', value: loadout.itemStats.magicPower }, { label: 'HP', value: loadout.itemStats.hp }, { label: 'Mana', value: loadout.itemStats.mana }, { label: 'Phys Defense', value: loadout.itemStats.physicalDefense }, { label: 'Magic Defense', value: loadout.itemStats.magicDefense }, { label: 'Movement SPD', value: loadout.itemStats.movementSpeed }, { label: 'ATK Speed', value: loadout.itemStats.attackSpeedPct * 100, suffix: '%' }, { label: 'Crit Chance', value: loadout.itemStats.critChancePct * 100, suffix: '%' }, { label: 'Lifesteal', value: loadout.itemStats.lifestealPct * 100, suffix: '%' }].filter((s) => round(s.value) !== 0) as stat (stat.label)}
					<div class="flex justify-between">
						<span class="text-ink-muted">{stat.label}</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(stat.value)}{stat.suffix ?? ''}</span
						>
					</div>
				{/each}
				{#if loadout.items.length === 0}
					<p class="col-span-2 text-xs text-ink-faint">
						Drag item ke slot atau klik untuk menambah
					</p>
				{/if}
			</div>
		</section>
	</div>
</div>
