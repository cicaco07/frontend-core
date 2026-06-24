<script lang="ts">
	import type { HeroSkill } from '$lib/types';
	import type { StatBlock } from '$lib/types/stats';
	import type { MultiAreaSkill, ShieldModifier } from '$lib/calc/hero-modifiers';
	import { computeMultiAreaDamage, computeShieldValue } from '$lib/calc/apply-modifiers';
	import { replaceAttributePlaceholders } from '$lib/utils/formatting';
	import { ChevronDown } from 'lucide-svelte';

	let {
		skill,
		level = 1,
		onLevelChange,
		baseDamage,
		skillAreas,
		shieldMod,
		stats,
		modifierState,
		isZilongPassive = false,
		loadoutHero
	}: {
		skill: HeroSkill;
		level?: number;
		onLevelChange?: (level: number) => void;
		baseDamage: number | { min: number; max: number };
		skillAreas: MultiAreaSkill['areas'] | null;
		shieldMod: ShieldModifier | null;
		stats: StatBlock;
		modifierState: { targetLowHp?: boolean; passiveStacks?: number };
		isZilongPassive?: boolean;
		loadoutHero: { slug: string } | null;
	} = $props();

	const maxLevel = $derived(skill.levelData?.length ?? 0);
	const currentLevelData = $derived(skill.levelData?.find((l) => l.level === level));

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}
</script>

<div class="rounded-lg border border-line bg-bg/50 p-3">
	<div class="flex items-start gap-3">
		{#if skill.imageUrl}
			<span class="size-12 shrink-0 overflow-hidden rounded-lg bg-surface-3">
				<img src={skill.imageUrl} alt={skill.name} class="h-full w-full object-cover" />
			</span>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="flex items-center justify-between gap-2">
				<span class="text-sm font-semibold text-ink">{skill.name}</span>
				<div class="flex items-center gap-2">
					{#if maxLevel > 0}
						<select
							class="rounded border border-line bg-bg px-1.5 py-0.5 text-xs text-ink"
							value={level}
							onchange={(e) => onLevelChange?.(Number(e.currentTarget.value))}
						>
							{#each skill.levelData ?? [] as lvl (lvl.level)}
								<option value={lvl.level}>Lv {lvl.level}</option>
							{/each}
						</select>
					{/if}
				</div>
			</div>
			{#if skill.description}
				<p class="mt-1 text-xs leading-relaxed text-ink-muted">
					{@html replaceAttributePlaceholders(
						skill.description,
						skill.levelData,
						level
					)}
				</p>
			{/if}
			{#if currentLevelData}
				<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
					{#each currentLevelData.attributes as attr (attr.label)}
						<span class="text-xs text-ink-muted">
							<span class="text-ink-faint">{attr.label}:</span>
							<span class="font-mono-stat text-ink">{attr.value}</span>
						</span>
					{/each}
				</div>
			{/if}

			<!-- Output Widgets (Total Damage, Shield, etc.) -->
			<div class="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
				{#if isZilongPassive}
					{@const lowHpBonus = modifierState.targetLowHp ? 30 : 0}
					{@const flurryRaw = 80 + 0.3 * stats.physicalAttack + lowHpBonus}
					{@const flurryHitDmg = 0}
					{@const regenRaw = 50 + 0.2 * stats.physicalAttack}
					<div class="rounded-xl border border-line bg-surface-2/60 p-3 shadow-sm">
						<span class="text-[10px] font-bold tracking-wider text-accent uppercase">
							Damage Enhance
						</span>
						<div class="font-mono-stat mt-1.5 text-lg font-extrabold text-accent">
							{round(flurryRaw * 3)}
						</div>
						<p class="mt-1 text-[10px] text-ink-muted">
							Dragon Flurry: 3x {round(flurryRaw)} per hit (raw).
						</p>
					</div>

					<div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 shadow-sm">
						<span class="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
							HP Regen
						</span>
						<div class="font-mono-stat mt-1.5 text-lg font-extrabold text-emerald-400">
							{round(regenRaw * 3)}
						</div>
						<p class="mt-1 text-[10px] text-emerald-300/80">
							Dragon Flurry: 3x {round(regenRaw)} per hit.
						</p>
					</div>

					<div class="rounded-xl border border-line bg-surface-2/60 p-3 shadow-sm sm:col-span-2">
						<span class="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
							Damage Enhance
						</span>
						<div class="font-mono-stat mt-1.5 text-lg font-extrabold text-amber-400">
							{modifierState.targetLowHp ? 'Active' : 'Inactive'}
						</div>
						<p class="mt-1 text-[10px] text-ink-muted">
							+30 damage saat HP target &lt; 50%.
						</p>
					</div>
				{:else if skill.damageType !== 'none' || (typeof baseDamage === 'object' ? baseDamage.min > 0 : baseDamage > 0)}
					{#if skillAreas && skillAreas.length > 0}
						{#each computeMultiAreaDamage(typeof baseDamage === 'object' ? baseDamage.min : baseDamage, skillAreas) as area (area.label)}
							<div class="rounded-xl border border-line bg-surface-2/60 p-3 shadow-sm">
								<span class="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
									Dmg ({area.label})
								</span>
								<div class="font-mono-stat mt-1.5 text-lg font-extrabold text-accent">
									{round(area.damage)}
								</div>
							</div>
						{/each}
					{:else}
						<div class="rounded-xl border border-line bg-surface-2/60 p-3 shadow-sm">
							<span class="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
								Total Damage
							</span>
							<div class="font-mono-stat mt-1.5 text-lg font-extrabold text-accent">
								{#if typeof baseDamage === 'object'}
									{round(baseDamage.min)} - {round(baseDamage.max)}
								{:else}
									{round(baseDamage)}
								{/if}
							</div>
						</div>
					{/if}
				{/if}

				{#if shieldMod}
					<div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 shadow-sm">
						<span class="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
							Total Shield
						</span>
						<div class="font-mono-stat mt-1.5 text-lg font-extrabold text-emerald-400">
							{round(computeShieldValue(shieldMod, stats, modifierState.passiveStacks ?? 0))}
						</div>
						<p class="mt-1 text-[10px] leading-relaxed text-emerald-300/80">
							Shield penyerap damage selama {shieldMod.duration} detik yang diperoleh ketika
							menggunakan skill ini.
						</p>
					</div>
				{/if}
			</div>

			{#if skill.levelData && skill.levelData.length > 0}
				<div class="mt-2">
					<details class="group">
						<summary
							class="flex cursor-pointer list-none items-center gap-1 text-xs text-ink-faint transition-colors hover:text-ink-muted"
						>
							<ChevronDown class="size-3 transition group-open:rotate-180" />
							All Levels
						</summary>
						<div class="mt-2 overflow-x-auto">
							<table class="w-full text-xs">
								<thead>
									<tr class="border-b border-line text-ink-faint">
										<th class="px-2 py-1 text-left">Lv</th>
										{#each skill.levelData[0]?.attributes ?? [] as attr (attr.label)}
											<th class="px-2 py-1 text-right">{attr.label}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each skill.levelData as lvlData (lvlData.level)}
										<tr
											class="border-b border-line/50 {lvlData.level === level
												? 'bg-accent/10'
												: 'hover:bg-surface-2/50'}"
										>
											<td class="px-2 py-1 font-medium text-ink-muted">{lvlData.level}</td>
											{#each lvlData.attributes as attr (attr.label)}
												<td class="font-mono-stat px-2 py-1 text-right text-ink tabular-nums">{attr.value}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</details>
				</div>
			{/if}
		</div>
	</div>
</div>
