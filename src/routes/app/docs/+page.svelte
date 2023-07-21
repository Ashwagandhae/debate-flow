<script lang="ts">
	import ButtonBar from '$lib/components/ButtonBar.svelte';
	import DocGroup from '$lib/components/DocGroup.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import NavTab from '$lib/components/NavTab.svelte';
	import { openPopup } from '$lib/models/popup';
	import type { Doc } from '$lib/models/type';

	// dummy data
	let docs: Doc[] = [
		{
			name: 'Browser flow name',
			// choose far away date
			created: new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000),
			expire: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
			style: 'policy'
		},
		{
			name: 'Very cool flow name',
			// choose far away date
			created: new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000),
			expire: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
			style: 'policy'
		}
	];
</script>

<DocGroup {docs} />

<style>
</style>
