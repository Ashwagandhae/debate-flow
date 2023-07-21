<script lang="ts">
	import type { Doc as DocType } from '$lib/models/type';
	import Doc from './Doc.svelte';
	export let docs: DocType[];
</script>

<div class="flows">
	{#each docs as doc}
		<Doc {doc} />
	{/each}
</div>

<style>
	.flowGroup {
		display: flex;
		flex-direction: column;
		width: auto;
		height: 100%;
		/* background: var(--background); */
		padding: var(--padding-big) var(--padding);
		border-radius: var(--border-radius);
	}

	.flows {
		gap: var(--padding);
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
	}
</style>
