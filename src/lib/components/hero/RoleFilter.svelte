<script lang="ts">
	import type { HeroRole } from '$lib/types';
	import { HERO_ROLES, roleColor, titleCase } from '$lib/utils/labels';

	let { selected = $bindable(null) }: { selected?: HeroRole | null } = $props();

	function toggle(role: HeroRole) {
		selected = selected === role ? null : role;
	}
</script>

<div class="flex flex-wrap gap-2">
	<button
		type="button"
		onclick={() => (selected = null)}
		class="rounded-full border px-3 py-1 text-sm transition"
		class:border-line-strong={selected === null}
		class:bg-surface-3={selected === null}
		class:text-ink={selected === null}
		class:border-line={selected !== null}
		class:text-ink-muted={selected !== null}
	>
		All
	</button>
	{#each HERO_ROLES as role (role)}
		<button
			type="button"
			onclick={() => toggle(role)}
			class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition"
			class:text-ink={selected === role}
			class:text-ink-muted={selected !== role}
			style={selected === role
				? `border-color:${roleColor(role)};background:${roleColor(role)}22`
				: 'border-color:#1e293b'}
		>
			<span class="inline-block h-2 w-2 rounded-full" style="background:{roleColor(role)}"></span>
			{titleCase(role)}
		</button>
	{/each}
</div>
