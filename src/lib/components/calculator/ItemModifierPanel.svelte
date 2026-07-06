<script lang="ts">
	import type { Item } from '$lib/types/equipment';
	import type { ItemModifierState } from '$lib/calc/apply-item-modifiers';

	interface StackConfig {
		slug: string;
		label: string;
		max: number;
		description: string;
	}

	interface ToggleConfig {
		slug: string;
		label: string;
		description: string;
	}

	const STACK_CONFIGS: StackConfig[] = [
		{
			slug: 'brute-force-breastplate',
			label: 'Brute Force Breastplate',
			max: 6,
			description: '+6 Adaptive Attack dan +2% Movement Speed per stack. Full stack: +15% Control Duration Reduction.'
		},
		{
			slug: 'war-axe',
			label: 'War Axe',
			max: 6,
			description: '+12 Physical Attack per stack. Full stack memberi bonus damage.'
		},
		{
			slug: 'clock-of-destiny',
			label: 'Clock of Destiny',
			max: 6,
			description: '+Hybrid Defense per stack berdasarkan level hero.'
		},
		{
			slug: 'concentrated-energy',
			label: 'Concentrated Energy',
			max: 6,
			description: '+5 Magic Power per stack. Full stack: +12% Magic Damage.'
		},
		{
			slug: 'radiant-armor',
			label: 'Radiant Armor',
			max: 6,
			description: '+Magic Defense per stack berdasarkan level hero.'
		},
		{
			slug: 'genius-wand',
			label: 'Genius Wand',
			max: 3,
			description: 'Mengurangi Magic Defense target per stack.'
		},
		{
			slug: 'feather-of-heaven',
			label: 'Feather of Heaven - Impulse',
			max: 5,
			description: '+6% Attack Speed per stack.'
		},
		{
			slug: 'corrosion-scythe',
			label: 'Corrosion Scythe - Impulse',
			max: 5,
			description: '+6% Attack Speed per stack.'
		},
		{
			slug: 'swift-crossbow',
			label: 'Swift Crossbow - Impulse',
			max: 5,
			description: '+3% Attack Speed per stack.'
		}
	];

	const TOGGLE_CONFIGS: ToggleConfig[] = [
		{ slug: 'demon-hunter-sword', label: 'Demon Hunter Sword - Devour', description: 'Basic Attack menambah 8% target current HP sebagai Physical Damage.' },
		{ slug: 'feather-of-heaven', label: 'Feather of Heaven - Affliction', description: 'Basic Attack menambah 50 + 30% Magic Power sebagai Magic Damage.' },
		{ slug: 'corrosion-scythe', label: 'Corrosion Scythe - Corrosion', description: 'Basic Attack menambah 80 Physical Damage.' },
		{ slug: 'swift-crossbow', label: 'Swift Crossbow - Crossbow', description: 'Basic Attack menambah 40 Adaptive Damage.' },
		{ slug: 'azure-blade', label: 'Azure Blade - Judgement', description: 'Setelah skill, Basic Attack berikutnya +50 True Damage.' },
		{ slug: 'endless-battle', label: 'Endless Battle - Divine Justice', description: 'Setelah skill, Basic Attack berikutnya +60% Physical Attack True Damage.' },
		{ slug: 'starlium-scythe', label: 'Starlium Scythe - Crisis', description: 'Setelah skill, Basic Attack berikutnya +100 +100% Magic Power True Damage.' },
		{ slug: 'blade-of-the-heptaseas', label: 'Blade of the Heptaseas - Ambush', description: 'Basic Attack ambush +160 +40% Physical Attack Physical Damage.' },
		{ slug: 'thunder-belt', label: 'Thunder Belt - Thunderbolt', description: 'Basic Attack proc +50 + Physical Defense + Magic Defense True Damage.' },
		{ slug: 'windtalker', label: 'Windtalker - Typhoon', description: 'Basic Attack proc magic damage level-scaled dan dapat crit.' },
		{ slug: 'wishing-lantern', label: 'Wishing Lantern - Butterfly Goddess', description: 'Proc 10% target current HP sebagai Magic Damage.' },
		{ slug: 'golden-staff', label: 'Golden Staff - Endless Strike', description: 'Next Basic Attack mendapat +80% Attack Speed. Crit Chance juga dikonversi menjadi Attack Speed.' },
		{
			slug: 'berserkers-fury',
			label: "Berserker's Fury - Doom",
			description: 'Critical strike aktif: +5% Physical Attack.'
		},
		{
			slug: 'haass-claws',
			label: "Haas's Claws - Frenzy",
			description: 'Critical strike aktif: +20% Attack Speed.'
		},
		{
			slug: 'blade-of-despair',
			label: 'Blade of Despair - Despair',
			description: 'Target non-minion di bawah 50% HP: +25% Physical Attack.'
		}
	];

	let {
		items,
		state
	}: {
		items: Item[];
		state: ItemModifierState;
	} = $props();

	const hasItem = (slug: string) => items.some((item) => item.slug === slug);
	const activeStackConfigs = $derived(STACK_CONFIGS.filter((config) => hasItem(config.slug)));
	const activeToggleConfigs = $derived(TOGGLE_CONFIGS.filter((config) => hasItem(config.slug)));
	const showSeaHalberd = $derived(hasItem('sea-halberd'));
	const showQueensWings = $derived(hasItem('queens-wings'));
	const hasModifiers = $derived(
		activeStackConfigs.length > 0 ||
			activeToggleConfigs.length > 0 ||
			showSeaHalberd ||
			showQueensWings
	);

	function setStack(slug: string, value: number) {
		state.itemStacks = {
			...state.itemStacks,
			[slug]: value
		};
	}

	function setToggle(slug: string, value: boolean) {
		state.itemToggles = {
			...state.itemToggles,
			[slug]: value
		};
	}
</script>

{#if hasModifiers}
	<div class="rounded-2xl border border-line bg-surface-2/70 p-4">
		<div class="mb-3 flex items-center justify-between gap-3">
			<div>
				<h3 class="font-display text-sm font-bold tracking-wide text-ink uppercase">Item Modifiers</h3>
				<p class="text-[11px] text-ink-faint">Atur stack/toggle item yang memiliki efek conditional.</p>
			</div>
		</div>

		<div class="space-y-4">
			{#each activeStackConfigs as config (config.slug)}
				{@const value = state.itemStacks[config.slug] ?? 0}
				<label class="block rounded-xl border border-line bg-surface/60 p-3">
					<div class="mb-2 flex items-center justify-between gap-3">
						<div>
							<p class="text-xs font-bold text-ink">{config.label}</p>
							<p class="text-[10px] leading-snug text-ink-faint">{config.description}</p>
						</div>
						<span class="font-mono-stat rounded-lg bg-accent/10 px-2 py-1 text-xs text-accent">
							{value}/{config.max}
						</span>
					</div>
					<input
						type="range"
						min="0"
						max={config.max}
						step="1"
						value={value}
						oninput={(event) => setStack(config.slug, Number(event.currentTarget.value))}
						class="w-full accent-accent"
					/>
					<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
						<span>0</span><span>{config.max}</span>
					</div>
				</label>
			{/each}

			{#each activeToggleConfigs as config (config.slug)}
				<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface/60 p-3">
					<input
						type="checkbox"
						checked={state.itemToggles[config.slug] ?? false}
						onchange={(event) => setToggle(config.slug, event.currentTarget.checked)}
						class="mt-1 size-4 rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent"
					/>
					<span>
						<span class="block text-xs font-bold text-ink">{config.label}</span>
						<span class="block text-[10px] leading-snug text-ink-faint">{config.description}</span>
					</span>
				</label>
			{/each}

			{#if showSeaHalberd}
				<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface/60 p-3">
					<input
						type="checkbox"
						bind:checked={state.targetHigherExtraHp}
						class="mt-1 size-4 rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent"
					/>
					<span>
						<span class="block text-xs font-bold text-ink">Sea Halberd - Punish</span>
						<span class="block text-[10px] leading-snug text-ink-faint">Target memiliki extra HP lebih tinggi: +8% damage.</span>
					</span>
				</label>
			{/if}

			{#if showQueensWings}
				<label class="block rounded-xl border border-line bg-surface/60 p-3">
					<div class="mb-2 flex items-center justify-between gap-3">
						<div>
							<p class="text-xs font-bold text-ink">Queen's Wings - Defiance</p>
							<p class="text-[10px] leading-snug text-ink-faint">Semakin rendah HP, damage meningkat hingga 15%.</p>
						</div>
						<span class="font-mono-stat rounded-lg bg-accent/10 px-2 py-1 text-xs text-accent">
							{Math.round(state.selfHpPct * 100)}% HP
						</span>
					</div>
					<input
						type="range"
						min="1"
						max="100"
						step="1"
						value={Math.round(state.selfHpPct * 100)}
						oninput={(event) => (state.selfHpPct = Number(event.currentTarget.value) / 100)}
						class="w-full accent-accent"
					/>
					<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
						<span>1%</span><span>100%</span>
					</div>
				</label>
			{/if}
		</div>
	</div>
{/if}
