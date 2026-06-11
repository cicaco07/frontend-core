<script lang="ts">
	import type { PageData } from './$types';
	import { Loadout } from '$lib/stores/loadout.svelte';
	import { roleColor, titleCase } from '$lib/utils/labels';
	import type { Emblem, Item } from '$lib/types/equipment';
	import type { Hero } from '$lib/types';
	import { ChevronDown } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const loadout = new Loadout();
	const targetLoadout = new Loadout();

	$effect(() => {
		loadout.target = targetLoadout.finalStats;
	});

	let dragItem = $state<Item | null>(null);
	let searchQuery = $state('');
	let heroDropdownOpen = $state(false);
	let targetHeroDropdownOpen = $state(false);
	let openEmblem = $state<string | null>(null);
	let openTargetEmblem = $state<string | null>(null);

	const sortedHeroes = $derived([...data.heroes].sort((a, b) => a.name.localeCompare(b.name)));

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

	function selectHero(hero: Hero) {
		loadout.hero = hero;
		heroDropdownOpen = false;
	}

	function selectTargetHero(hero: Hero) {
		targetLoadout.hero = hero;
		targetHeroDropdownOpen = false;
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

	function selectMainEmblem(slug: string) {
		loadout.mainEmblem = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectPrimaryTalent(slug: string) {
		loadout.primaryTalent = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectTier1Talent(slug: string) {
		loadout.tier1Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectTier2Talent(slug: string) {
		loadout.tier2Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectTargetMainEmblem(slug: string) {
		targetLoadout.mainEmblem = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	function selectTargetPrimaryTalent(slug: string) {
		targetLoadout.primaryTalent = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	function selectTargetTier1Talent(slug: string) {
		targetLoadout.tier1Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	function selectTargetTier2Talent(slug: string) {
		targetLoadout.tier2Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	const emblemSelector: Record<string, (slug: string) => void> = {
		main: (s) => selectMainEmblem(s),
		primary: (s) => selectPrimaryTalent(s),
		s1: (s) => selectTier1Talent(s),
		s2: (s) => selectTier2Talent(s),
		tmain: (s) => selectTargetMainEmblem(s),
		tprimary: (s) => selectTargetPrimaryTalent(s),
		ts1: (s) => selectTargetTier1Talent(s),
		ts2: (s) => selectTargetTier2Talent(s)
	};

	function getSelectedEmblem(groupKey: string): Emblem | null {
		const map: Record<string, Emblem | null> = {
			main: loadout.mainEmblem,
			primary: loadout.primaryTalent,
			s1: loadout.tier1Talent,
			s2: loadout.tier2Talent,
			tmain: targetLoadout.mainEmblem,
			tprimary: targetLoadout.primaryTalent,
			ts1: targetLoadout.tier1Talent,
			ts2: targetLoadout.tier2Talent
		};
		return map[groupKey] ?? null;
	}

	function handleEmblemSelect(slug: string, groupKey: string) {
		emblemSelector[groupKey]?.(slug);
		if (groupKey.startsWith('t')) {
			openTargetEmblem = null;
		} else {
			openEmblem = null;
		}
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-emblem-dropdown]')) {
			openEmblem = null;
			openTargetEmblem = null;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="mx-auto max-w-[1400px] space-y-6 px-4 py-10 sm:px-6">
	<div>
		<h1 class="font-display text-3xl font-bold text-ink">Kalkulator Damage</h1>
		<p class="mt-1 text-sm text-ink-muted">
			Hitung damage, DPS, dan output build secara real-time.
		</p>
	</div>

	<div class="grid gap-6 xl:grid-cols-[300px_1fr_300px]">
		<!-- LEFT WIDGET: Loadout -->
		<section class="space-y-4 rounded-2xl border border-line bg-surface/82 p-4">
			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<div class="relative mt-1">
					<button
						type="button"
						onclick={() => (heroDropdownOpen = !heroDropdownOpen)}
						class="flex w-full items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<span>{loadout.hero?.name ?? 'Select hero�'}</span>
						<ChevronDown class="size-4 text-ink-faint" />
					</button>
					{#if heroDropdownOpen}
						<div
							class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
						>
							{#each sortedHeroes as hero (hero.id)}
								<button
									type="button"
									onclick={() => selectHero(hero)}
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
								>
									<span class="size-6 shrink-0 overflow-hidden rounded bg-surface-3">
										{#if hero.avatarUrl}
											<img src={hero.avatarUrl} alt="" class="h-full w-full object-cover" />
										{/if}
									</span>
									<span>{hero.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</label>

			{#if loadout.hero}
				<p class="flex items-center gap-2 text-sm" style="color:{roleColor(loadout.hero.role)}">
					<span
						class="inline-block h-2 w-2 rounded-full"
						style="background:{roleColor(loadout.hero.role)}"
					></span>
					{titleCase(loadout.hero.role)}
				</p>
			{/if}

			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Level: {loadout.level}</span
				>
				<input
					type="range"
					min="1"
					max="15"
					bind:value={loadout.level}
					class="mt-1 w-full accent-accent"
				/>
				<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
					<span>1</span><span>15</span>
				</div>
			</label>

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					{#each [{ key: 'main', label: 'Main Emblem', items: mainEmblems }, { key: 'primary', label: 'Primary Talent', items: primaryTalents }, { key: 's1', label: 'Tier 1 Talent', items: commonTalentsS1 }, { key: 's2', label: 'Tier 2 Talent', items: commonTalentsS2 }] as group (group.key)}
						{@const selected = group.items.find(
							(e) => e.slug === getSelectedEmblem(group.key)?.slug
						)}
						<div class="relative" data-emblem-dropdown>
							<button
								type="button"
								onclick={() => (openEmblem = openEmblem === group.key ? null : group.key)}
								class="flex w-full items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
							>
								{#if selected}
									{#if selected.icon}
										<span class="size-5 shrink-0 overflow-hidden rounded">
											<img src={selected.icon} alt="" class="h-full w-full object-contain" />
										</span>
									{/if}
									<span class="flex-1 text-left">{selected.name}</span>
								{:else}
									<span class="flex-1 text-left">{group.label}…</span>
								{/if}
								<ChevronDown class="size-4 shrink-0 text-ink-faint" />
							</button>
							{#if openEmblem === group.key}
								<div
									class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
								>
									{#each group.items as em (em.id)}
										<button
											type="button"
											onclick={() => handleEmblemSelect(em.slug, group.key)}
											class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
										>
											{#if em.icon}
												<span class="size-5 shrink-0 overflow-hidden rounded">
													<img src={em.icon} alt="" class="h-full w-full object-contain" />
												</span>
											{/if}
											<span>{em.name}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div>
				<span class="text-xs tracking-wide text-ink-faint uppercase"
					>Items ({loadout.items.length}/6)</span
				>
				<ul class="mt-1 space-y-1">
					{#each loadout.items as item, i (item.id + i)}
						<li
							class="flex items-center justify-between rounded border border-line bg-bg/50 px-2 py-1 text-sm"
						>
							<span class="text-ink">{item.name}</span>
							<button
								type="button"
								onclick={() => loadout.removeItem(i)}
								class="text-xs text-ink-faint hover:text-red-400">remove</button
							>
						</li>
					{/each}
				</ul>
				{#if loadout.items.length < 6}
					<select
						onchange={(e) => {
							const select = e.target as HTMLSelectElement;
							const item = data.items.find((i) => i.id === select.value);
							if (item) loadout.addItem(item);
							select.value = '';
						}}
						value=""
						class="mt-1 w-full rounded border border-line bg-bg px-3 py-2 text-sm"
					>
						<option value="">Add item�</option>
						{#each data.items as item (item.id)}
							<option value={item.id}>{item.name}</option>
						{/each}
					</select>
				{/if}
			</div>
		</section>

		<!-- MIDDLE WIDGET: Stats Display -->
		<section
			class="flex flex-col items-center justify-start rounded-2xl border border-line bg-surface/60 p-6"
		>
			<div class="mb-4 size-36 overflow-hidden rounded-full border-2 border-accent/40 bg-accent/10">
				{#if loadout.hero?.avatarUrl}
					<img
						src={loadout.hero.avatarUrl}
						alt={loadout.hero.name}
						class="h-full w-full object-cover"
					/>
				{/if}
			</div>
			<h2 class="font-display text-2xl font-bold text-ink">{loadout.hero?.name ?? 'Pilih Hero'}</h2>
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

			{#if loadout.hero}
				<div class="mt-6 w-full max-w-sm border-t border-line pt-4">
					<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
						>Skills</span
					>
					<div class="mt-2 space-y-2">
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
				</div>
			{/if}
		</section>

		<!-- RIGHT WIDGET: Target -->
		<section
			class="space-y-4 rounded-2xl border border-line bg-surface/82 p-4"
			style="border-top:3px solid var(--color-accent, #fb6a6a)"
		>
			<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
				>Target</span
			>

			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<div class="relative mt-1">
					<button
						type="button"
						onclick={() => (targetHeroDropdownOpen = !targetHeroDropdownOpen)}
						class="flex w-full items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<span>{targetLoadout.hero?.name ?? 'Select target�'}</span>
						<ChevronDown class="size-4 text-ink-faint" />
					</button>
					{#if targetHeroDropdownOpen}
						<div
							class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
						>
							{#each sortedHeroes as hero (hero.id)}
								<button
									type="button"
									onclick={() => selectTargetHero(hero)}
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
								>
									<span class="size-6 shrink-0 overflow-hidden rounded bg-surface-3">
										{#if hero.avatarUrl}
											<img src={hero.avatarUrl} alt="" class="h-full w-full object-cover" />
										{/if}
									</span>
									<span>{hero.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</label>

			{#if targetLoadout.hero}
				<p
					class="flex items-center gap-2 text-sm"
					style="color:{roleColor(targetLoadout.hero.role)}"
				>
					<span
						class="inline-block h-2 w-2 rounded-full"
						style="background:{roleColor(targetLoadout.hero.role)}"
					></span>
					{titleCase(targetLoadout.hero.role)}
				</p>
			{/if}

			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Level: {targetLoadout.level}</span
				>
				<input
					type="range"
					min="1"
					max="15"
					bind:value={targetLoadout.level}
					class="mt-1 w-full accent-accent"
				/>
				<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
					<span>1</span><span>15</span>
				</div>
			</label>

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					{#each [{ key: 'tmain', label: 'Main Emblem', items: mainEmblems }, { key: 'tprimary', label: 'Primary Talent', items: primaryTalents }, { key: 'ts1', label: 'Tier 1 Talent', items: commonTalentsS1 }, { key: 'ts2', label: 'Tier 2 Talent', items: commonTalentsS2 }] as group (group.key)}
						{@const selected = group.items.find(
							(e) => e.slug === getSelectedEmblem(group.key)?.slug
						)}
						<div class="relative" data-emblem-dropdown>
							<button
								type="button"
								onclick={() =>
									(openTargetEmblem = openTargetEmblem === group.key ? null : group.key)}
								class="flex w-full items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
							>
								{#if selected}
									{#if selected.icon}
										<span class="size-5 shrink-0 overflow-hidden rounded">
											<img src={selected.icon} alt="" class="h-full w-full object-contain" />
										</span>
									{/if}
									<span class="flex-1 text-left">{selected.name}</span>
								{:else}
									<span class="flex-1 text-left">{group.label}…</span>
								{/if}
								<ChevronDown class="size-4 shrink-0 text-ink-faint" />
							</button>
							{#if openTargetEmblem === group.key}
								<div
									class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
								>
									{#each group.items as em (em.id)}
										<button
											type="button"
											onclick={() => handleEmblemSelect(em.slug, group.key)}
											class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
										>
											{#if em.icon}
												<span class="size-5 shrink-0 overflow-hidden rounded">
													<img src={em.icon} alt="" class="h-full w-full object-contain" />
												</span>
											{/if}
											<span>{em.name}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div>
				<span class="text-xs tracking-wide text-ink-faint uppercase"
					>Items ({targetLoadout.items.length}/6)</span
				>
				<ul class="mt-1 space-y-1">
					{#each targetLoadout.items as item, i (item.id + i)}
						<li
							class="flex items-center justify-between rounded border border-line bg-bg/50 px-2 py-1 text-sm"
						>
							<span class="text-ink">{item.name}</span>
							<button
								type="button"
								onclick={() => targetLoadout.removeItem(i)}
								class="text-xs text-ink-faint hover:text-red-400">remove</button
							>
						</li>
					{/each}
				</ul>
				{#if targetLoadout.items.length < 6}
					<select
						onchange={(e) => {
							const select = e.target as HTMLSelectElement;
							const item = data.items.find((i) => i.id === select.value);
							if (item) targetLoadout.addItem(item);
							select.value = '';
						}}
						value=""
						class="mt-1 w-full rounded border border-line bg-bg px-3 py-2 text-sm"
					>
						<option value="">Add item�</option>
						{#each data.items as item (item.id)}
							<option value={item.id}>{item.name}</option>
						{/each}
					</select>
				{/if}
			</div>
		</section>
	</div>

	<!-- Items Section -->
	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-2xl border border-line bg-surface/82 p-4">
			<div class="mb-3 flex items-center justify-between">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Items ({loadout.items.length}/6)</span
				>
				<input
					type="search"
					placeholder="Search item�"
					bind:value={searchQuery}
					class="w-48 rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
				/>
			</div>

			<div class="mb-4 grid grid-cols-6 gap-2" role="list">
				{#each [0, 1, 2, 3, 4, 5] as i (i)}
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
								�
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
