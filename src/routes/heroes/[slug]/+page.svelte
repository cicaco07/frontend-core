<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
</script>

<a href={resolve('/heroes')} class="text-sm text-slate-400 hover:text-white"
	>&larr; Back to heroes</a
>
<h1 class="mt-2 text-2xl font-bold">{data.hero.name}</h1>
<p class="text-slate-400 capitalize">{data.hero.role}</p>
