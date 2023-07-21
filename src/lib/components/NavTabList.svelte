<script lang="ts">
	import NavTab from './NavTab.svelte';
	import { page } from '$app/stores';
	export let tabs: { link: string; title: string }[] = [];

	export let title: string = 'Title';
	$: title = tabs.find((tab) => tab.link === $page.url.pathname)?.title ?? 'Title';
</script>

{#each tabs as tab, index}
	<NavTab {...tab} />
{/each}
