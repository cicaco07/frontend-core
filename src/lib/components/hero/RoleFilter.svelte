<script lang="ts">
	import type { HeroRole } from '$lib/types';
	import { HERO_ROLES, roleColor, titleCase } from '$lib/utils/labels';

	let {
		selectedRole = $bindable(null),
		selectedLane = $bindable(null)
	}: {
		selectedRole?: HeroRole | null;
		selectedLane?: string | null;
	} = $props();

	const LANES = ['Gold Lane', 'Mid Lane', 'Exp Lane', 'Jungle', 'Roam'] as const;

	function toggleRole(role: HeroRole) {
		selectedRole = selectedRole === role ? null : role;
	}

	function toggleLane(lane: string) {
		selectedLane = selectedLane === lane ? null : lane;
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => (selectedRole = null)}
			class="rounded-full border px-3 py-1 text-sm transition"
			class:border-line-strong={selectedRole === null}
			class:bg-surface-3={selectedRole === null}
			class:text-ink={selectedRole === null}
			class:border-line={selectedRole !== null}
			class:text-ink-muted={selectedRole !== null}
		>
			All
		</button>
		{#each HERO_ROLES as role (role)}
			<button
				type="button"
				onclick={() => toggleRole(role)}
				class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition"
				class:text-ink={selectedRole === role}
				class:text-ink-muted={selectedRole !== role}
				style={selectedRole === role
					? `border-color:${roleColor(role)};background:${roleColor(role)}22`
					: 'border-color:var(--color-line)'}
			>
				<span class="inline-block h-2 w-2 rounded-full" style="background:{roleColor(role)}"></span>
				{titleCase(role)}
			</button>
		{/each}
	</div>

	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => (selectedLane = null)}
			class="rounded-full border px-3 py-1 text-sm transition"
			class:border-line-strong={selectedLane === null}
			class:bg-surface-3={selectedLane === null}
			class:text-ink={selectedLane === null}
			class:border-line={selectedLane !== null}
			class:text-ink-muted={selectedLane !== null}
		>
			All Lanes
		</button>
		{#each LANES as lane (lane)}
			<button
				type="button"
				onclick={() => toggleLane(lane)}
				class="rounded-full border px-3 py-1 text-sm transition"
				class:border-accent={selectedLane === lane}
				class:bg-accent={selectedLane === lane}
				class:text-bg={selectedLane === lane}
				class:border-line={selectedLane !== lane}
				class:text-ink-muted={selectedLane !== lane}
			>
				{lane}
			</button>
		{/each}
	</div>
</div>
