<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import {
		Swords,
		Wrench,
		Trophy,
		Package,
		Shield,
		BarChart3,
		Calculator,
		ChevronLeft,
		ChevronRight,
		Menu,
		Sun,
		Moon
	} from 'lucide-svelte';

	let {
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		onMobileClose = () => {},
		theme = $bindable<'dark' | 'light'>('dark'),
		onThemeToggle = () => {}
	}: {
		collapsed?: boolean;
		mobileOpen?: boolean;
		onMobileClose?: () => void;
		theme?: 'dark' | 'light';
		onThemeToggle?: () => void;
	} = $props();

	type NavItem = {
		href:
			| '/heroes'
			| '/items'
			| '/emblems'
			| '/builds'
			| '/theorycrafter'
			| '/stats'
			| '/tournaments';
		label: string;
		icon: typeof Swords;
	};
	type NavCategory = { label: string; items: NavItem[] };

	const nav: NavCategory[] = [
		{
			label: 'Explore',
			items: [
				{ href: '/heroes', label: 'Heroes', icon: Swords },
				{ href: '/items', label: 'Items', icon: Package },
				{ href: '/emblems', label: 'Emblems', icon: Shield }
			]
		},
		{
			label: 'Build',
			items: [
				{ href: '/builds', label: 'Builds', icon: Wrench },
				{ href: '/theorycrafter', label: 'Kalkulator Damage', icon: Calculator },
				{ href: '/stats', label: 'Stats', icon: BarChart3 }
			]
		},
		{
			label: 'Competitive',
			items: [{ href: '/tournaments', label: 'Tournaments', icon: Trophy }]
		}
	] as const;

	function isActive(href: string): boolean {
		return $page.url.pathname.startsWith(href);
	}
</script>

<button
	type="button"
	onclick={() => (mobileOpen = !mobileOpen)}
	class="btn fixed top-4 left-4 z-50 btn-square btn-ghost md:hidden"
	aria-label="Toggle navigation"
>
	<Menu class="size-5" />
</button>
{#if mobileOpen}
	<button
		type="button"
		onclick={onMobileClose}
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		aria-label="Close navigation"
	></button>
	<aside
		class="fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col rounded-r-2xl border-r border-line/50 bg-surface shadow-2xl md:hidden"
	>
		<div class="flex h-16 items-center border-b border-line/50 px-5">
			<a
				href={resolve('/')}
				class="font-display text-base font-bold tracking-[0.18em] text-ink uppercase"
			>
				ML THEORYCRAFT
			</a>
		</div>
		<nav class="flex-1 space-y-4 overflow-y-auto p-3">
			{#each nav as category (category.label)}
				<div>
					<p class="mb-1 px-3 text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
						{category.label}
					</p>
					<div class="space-y-0.5">
						{#each category.items as { href, label, icon: Icon } (href)}
							<a
								href={resolve(href)}
								class={[
									'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
									isActive(href)
										? 'bg-accent/15 text-accent shadow-sm shadow-accent/10'
										: 'text-ink-muted hover:bg-surface-2 hover:text-ink'
								].join(' ')}
								onclick={onMobileClose}
							>
								<Icon class="size-4 shrink-0" />
								{label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</nav>
		<div class="border-t border-line/50 p-3">
			<button
				type="button"
				onclick={onThemeToggle}
				class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-muted transition-all duration-200 hover:bg-surface-2 hover:text-ink"
			>
				{#if theme === 'dark'}
					<Sun class="size-4 shrink-0" />
				{:else}
					<Moon class="size-4 shrink-0" />
				{/if}
				Theme
			</button>
		</div>
	</aside>
{/if}
<aside
	class="fixed top-0 left-0 z-40 hidden h-full flex-col overflow-hidden rounded-r-2xl border-r border-line/50 bg-surface transition-all duration-300 ease-in-out md:flex"
	class:w-[260px]={!collapsed}
	class:w-[64px]={collapsed}
>
	<div
		class="flex h-16 shrink-0 items-center border-b border-line/50 {collapsed
			? 'justify-center px-0'
			: 'px-5'}"
	>
		<a
			href={resolve('/')}
			class="font-display font-bold tracking-[0.18em] text-ink uppercase"
			class:text-lg={!collapsed}
			class:text-xs={collapsed}
		>
			{collapsed ? 'ML' : 'ML THEORYCRAFT'}
		</a>
	</div>
	<nav class="mt-4 flex-1 space-y-4 overflow-y-auto p-2">
		{#each nav as category (category.label)}
			<div>
				{#if !collapsed}
					<p class="mb-1 px-3 text-[10px] font-bold tracking-[0.2em] text-ink-faint uppercase">
						{category.label}
					</p>
				{/if}
				<div class="space-y-0.5">
					{#each category.items as { href, label, icon: Icon } (href)}
						<a
							href={resolve(href)}
							class={[
								'flex items-center rounded-xl text-sm font-medium transition-all duration-200',
								collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
								isActive(href)
									? 'bg-accent/15 text-accent shadow-sm shadow-accent/10'
									: 'text-ink-muted hover:bg-surface-2 hover:text-ink'
							].join(' ')}
							title={collapsed ? label : undefined}
						>
							<Icon class="size-4 shrink-0" />
							{#if !collapsed}
								<span>{label}</span>
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</nav>
	<div class="space-y-1 border-t border-line/50 p-2">
		<button
			type="button"
			onclick={() => (collapsed = !collapsed)}
			class="mx-auto flex size-10 items-center justify-center rounded-xl text-ink-muted transition-all duration-200 hover:bg-surface-2 hover:text-ink"
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			{#if collapsed}
				<ChevronRight class="size-4" />
			{:else}
				<ChevronLeft class="size-4" />
			{/if}
		</button>
		<button
			type="button"
			onclick={onThemeToggle}
			class={[
				'flex w-full items-center rounded-xl text-sm font-medium transition-all duration-200',
				collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
				'text-ink-muted hover:bg-surface-2 hover:text-ink'
			].join(' ')}
		>
			{#if theme === 'dark'}
				<Sun class="size-4 shrink-0" />
			{:else}
				<Moon class="size-4 shrink-0" />
			{/if}
			{#if !collapsed}
				<span>Theme</span>
			{/if}
		</button>
	</div>
</aside>
