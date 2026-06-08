<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="space-y-4">
	<h1 class="text-3xl font-bold">Mobile Legends Theorycraft</h1>
	<p class="max-w-2xl text-slate-300">
		Browse heroes, items, and emblems, then jump into the theorycrafter to calculate damage, DPS,
		and effective output for any build you configure.
	</p>
	<a
		href={resolve('/theorycrafter')}
		class="inline-block rounded-md bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500"
	>
		Open Theorycrafter
	</a>
</div>
