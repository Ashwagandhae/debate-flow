<script lang="ts">
	import { keyDict } from '$lib/models/shortcut';
	export let keys: string[];
</script>

<span class="top">
	{#each keys as key}
		{#if key in keyDict}
			<kbd class="modifier">{keyDict[key]}</kbd>
		{:else}
			<kbd class="key">{key.toUpperCase()}</kbd>
		{/if}
	{/each}
</span>

<style>
	.top {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		font-size: inherit;
		align-items: center;
	}
	kbd {
		font-weight: inherit;
		font-family: inherit;
		background: var(--background-indent);
		padding: var(--padding) var(--padding-big);
		border-radius: var(--border-radius);
		height: auto;
		box-sizing: border-box;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.key {
		font-size: calc(var(--font-size) * 1.5);
		background: var(--background-accent-secondary-active);
	}
	.modifier {
		font-size: calc(var(--font-size) * 1.5);
		background: var(--background-accent-active);
	}
</style>
