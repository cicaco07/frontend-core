<script lang="ts">
	import type { HeroModConfig } from '$lib/calc/hero-modifiers';
	import type { ModifierState } from '$lib/calc/apply-modifiers';
	import type { Hero } from '$lib/types';

	let {
		mod,
		hero,
		modifierState,
		round,
		onDeffReduction,
		deffReduction = 0
	}: {
		mod: HeroModConfig | null;
		hero: Hero | null;
		modifierState: ModifierState;
		round: (n: number) => number;
		onDeffReduction?: () => number;
		deffReduction?: number;
	} = $props();

	const passive = $derived(mod?.passive ?? null);
	const passiveSkill = $derived(hero?.skills.find((s) => s.skillType === 'passive'));
	const relatedSkill = $derived(
		passive?.type === 'stacking-flat-damage'
			? hero?.skills.find((s) => s.name.toLowerCase().includes((passive as any).skillName.toLowerCase()))
			: null
	);
	const modIcon = $derived(relatedSkill?.imageUrl ?? passiveSkill?.imageUrl);
</script>

{#if passive}
	<div class="rounded-lg border border-accent/30 bg-accent/5 p-3">
		<div class="flex items-start gap-2.5">
			{#if modIcon}
				<span class="size-10 shrink-0 overflow-hidden rounded-lg bg-surface-3">
					<img src={modIcon} alt={passive.label} class="h-full w-full object-cover" />
				</span>
			{/if}
			<div class="min-w-0 flex-1">
				{#if passive.type === 'zilong-passive'}
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-ink">Target HP &lt; 50%</span>
						<input
							id="zilong-target-hp-switch"
							type="checkbox"
							bind:checked={modifierState.targetLowHp}
							class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent"
						/>
					</div>
					<p class="mt-1 text-[10px] leading-relaxed text-ink-muted">
						Jika diaktifkan, semua damage dari skill dan Basic Attack Zilong akan meningkat sebanyak 30.
					</p>
					<div class="mt-2.5 space-y-1.5 border-t border-line/30 pt-2.5">
						<div class="flex items-center justify-between">
							<span class="text-xs font-semibold text-ink">Terkena Efek Pengurangan Skill 2</span>
							<input type="checkbox" bind:checked={modifierState.skill2DeffActive} class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent" />
						</div>
						{#if modifierState.skill2DeffActive}
							<div class="flex items-center justify-between">
								<span class="text-xs text-ink-muted">Level Skill 2</span>
								<span class="font-mono-stat text-xs text-accent">{modifierState.skill2DeffLevel ?? 0}</span>
							</div>
							<input type="range" min="0" max="6" step="1" bind:value={modifierState.skill2DeffLevel} class="mt-1 w-full accent-accent" />
							<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
								<span>0 (None)</span><span>6</span>
							</div>
							<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
								Mengurangi Physical Defense target sebesar {round(deffReduction)}.
							</p>
						{/if}
					</div>
				{:else if passive.type === 'layla-passive'}
					<div class="space-y-3">
						<div>
							<div class="flex justify-between items-center text-xs font-semibold text-ink">
								<span>Jarak Target (Unit)</span>
								<span class="text-accent">{round(modifierState.distance ?? 0)} Unit</span>
							</div>
							<input type="range" min="0" max="6" step="0.1" bind:value={modifierState.distance} class="mt-1.5 w-full accent-accent" />
							<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
								Meningkatkan seluruh damage Layla sebesar 2.5% per unit jarak (Maks +15% pada jarak 6 unit).
							</p>
						</div>
						<div class="border-t border-line/30 pt-2.5">
							<div class="flex justify-between items-center text-xs font-semibold text-ink">
								<span>Upgrade Destruction Rush</span>
								<span class="text-accent">Lv {modifierState.ultUpgradeCount ?? 0}</span>
							</div>
							<input type="range" min="0" max="3" step="1" bind:value={modifierState.ultUpgradeCount} class="mt-1.5 w-full accent-accent" />
							<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted flex justify-between items-center">
								<span>Range bonus: +{round((modifierState.ultUpgradeCount ?? 0) * 0.6)} unit</span>
								<span class="font-bold text-accent">Total: {round(4.3 + (modifierState.ultUpgradeCount ?? 0) * 0.6)} Unit</span>
							</p>
						</div>
					</div>
				{:else if passive.type === 'helcurt-passive'}
					<div class="space-y-3">
						<div>
							<div class="flex justify-between items-center text-xs font-semibold text-ink">
								<span>HP Regen (Missing HP)</span>
								<span class="text-emerald-400">{modifierState.passiveStacks}%</span>
							</div>
							<input type="range" min="10" max="20" step="1" bind:value={modifierState.passiveStacks} class="mt-1.5 w-full accent-accent" />
							<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
								Memulihkan {modifierState.passiveStacks}% HP yang hilang setiap 6 detik ketika tidak menerima damage.
							</p>
						</div>
						<div class="border-t border-line/30 pt-2.5">
							<div class="flex items-center justify-between">
								<span class="text-xs font-semibold text-ink">Shadow of Styx Aktif</span>
								<input type="checkbox" bind:checked={modifierState.shadowOfStyxActive} class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent" />
							</div>
							<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
								Meningkatkan Movement Speed sebesar 25%–55% dan memberikan enhanced Basic Attack.
							</p>
						</div>
						<div class="border-t border-line/30 pt-2.5">
							<div class="flex items-center justify-between">
								<span class="text-xs font-semibold text-ink">Skill 2 Minion DMG</span>
								<input type="checkbox" bind:checked={modifierState.skill2MinionDmg} class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent" />
							</div>
							<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
								80% damage tambahan terhadap minion (kalkulasi menyusul).
							</p>
						</div>
					</div>
				{:else if passive.type === 'crit-stacking-buff'}
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-ink">{passive.label}</span>
						<span class="font-mono-stat text-xs text-amber-400"
							>+{round(modifierState.passiveStacks * passive.perStack * 100)}% crit</span
						>
					</div>
					<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
						Setiap skill hit menambah {passive.perStack * 100}% Critical Chance. Stacking hingga {passive.maxStacks} kali.
					</p>
				{:else if passive.type === 'toggle-on-hit-buff'}
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-ink">{passive.label}</span>
						<label class="flex items-center gap-2 cursor-pointer">
							<span class="text-[10px] text-ink-faint">Active</span>
							<input type="checkbox" bind:checked={modifierState.bloodBanquetActive} class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent" />
						</label>
					</div>
					<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
						{round(passive.baseDamage + passive.magicScalingRatio * 0)} (+{passive.magicScalingRatio * 100}% Magic Power) + {round(passive.minHpRatio * 100)}%-{round(passive.maxHpRatio * 100)}% Max HP target sebagai Magic Damage per hit.
					</p>
				{:else if passive.type === 'fanny-passive'}
					<div class="space-y-2">
						<label class="flex items-center justify-between cursor-pointer">
							<span class="text-xs font-semibold text-ink">{passive.label}</span>
							<input type="checkbox" bind:checked={modifierState.fannyFlying} class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent" />
						</label>
						<p class="text-[10px] leading-relaxed text-ink-muted">
							Flying: +{passive.minAmp * 100}%-{passive.maxAmp * 100}% extra damage. Prey Mark: up to {passive.maxPreyMarks} marks, +{passive.preyMarkDamagePct * 100}% Ultimate damage each.
						</p>
						<label class="flex items-center justify-between cursor-pointer">
							<span class="text-[10px] text-ink-faint">Prey Marks</span>
							<input type="number" min="0" max={passive.maxPreyMarks} bind:value={modifierState.fannyPreyMarks}
								class="w-16 rounded-lg border border-line bg-bg px-2 py-1 text-xs text-ink tabular-nums focus:border-accent focus:outline-none" />
						</label>
					</div>
				{:else if passive.type === 'eudora-passive'}
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-ink">{passive.label}</span>
						<label class="flex items-center gap-2 cursor-pointer">
							<span class="text-[10px] text-ink-faint">Active</span>
							<input type="checkbox" bind:checked={modifierState.superconductorActive} class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent" />
						</label>
					</div>
					<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
						Full combo: S2 magic shred → S1 chain lightning → +{passive.comboAmp * 100}% bonus damage on all hits.
					</p>
				{:else}
					<div class="flex items-center justify-between">
						<span class="text-xs font-semibold text-ink">{passive.label}</span>
						{#if passive.type === 'stacking-buff'}
							<span class="font-mono-stat text-xs text-accent"
								>+{round(modifierState.passiveStacks * (passive as any).perStack * 100)}%</span
							>
						{:else if passive.type === 'stacking-flat-damage'}
							<span class="font-mono-stat text-xs text-amber-400"
								>+{round(modifierState.passiveStacks * (passive as any).perStack)} dmg</span
							>
						{:else if passive.type === 'mana-stacking'}
							<span class="font-mono-stat text-xs text-blue-400"
								>+{round(modifierState.passiveStacks * (passive as any).manaPerStack)} mana</span
							>
						{:else if passive.type === 'basic-attack-hp-scaling'}
							<span class="font-mono-stat text-xs text-amber-400"
								>{modifierState.passiveStacks > 0 ? 'Active' : 'Inactive'}</span
							>
						{/if}
					</div>
					{#if passive.type === 'stacking-buff'}
						<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
							Setiap dash menambah damage output {(passive as any).perStack * 100}% selama {(passive as any).duration} detik.
						</p>
					{:else if passive.type === 'stacking-flat-damage'}
						<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
							Setiap stack menambah +{(passive as any).perStack} Physical Damage pada Skill 1.
						</p>
					{:else if passive.type === 'mana-stacking'}
						<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
							Setiap hit skill menambah +{(passive as any).manaPerStack} Max Mana. Damage skill berskala dengan Max Mana.
						</p>
					{:else if passive.type === 'basic-attack-hp-scaling'}
						<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
							Basic Attack memberikan tambahan damage fisik sebesar {(passive as any).baseDamage} (+{(passive as any).hpScalingRatio * 100}% Total HP) ketika target memiliki Mark.
						</p>
					{/if}
				{/if}
			</div>
		</div>
		{#if passive && passive.type !== 'zilong-passive' && passive.type !== 'layla-passive' && passive.type !== 'helcurt-passive' && passive.type !== 'fanny-passive' && passive.type !== 'eudora-passive'}
			{@const maxStacks = (passive as any).maxStacks ?? 1}
			{#if passive.type === 'stacking-buff' || maxStacks === 1}
				<input type="range" min="0" max={maxStacks} bind:value={modifierState.passiveStacks} class="mt-2 w-full accent-accent" />
				<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
					{#each Array.from({ length: maxStacks + 1 }, (_, i) => i) as s (s)}
						<span>{maxStacks === 1 ? (s === 0 ? 'Off' : 'On') : s}</span>
					{/each}
				</div>
			{:else}
				<div class="mt-2 flex items-center gap-2">
					<input type="number" min="0" max={maxStacks} bind:value={modifierState.passiveStacks}
						class="w-full rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-ink tabular-nums placeholder:text-ink-faint focus:border-accent focus:outline-none"
						placeholder="0" />
					<span class="shrink-0 text-[10px] text-ink-faint">/ {maxStacks.toLocaleString()}</span>
				</div>
			{/if}
		{/if}
	</div>
{/if}
