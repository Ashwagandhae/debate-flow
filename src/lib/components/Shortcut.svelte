<script lang="ts">
	import { keyDict } from '$lib/models/shortcut';
	export let keys: string[];
</script>

<span class="top">
	{#each keys as key, index}
		{#if key in keyDict}
			<kbd class="modifier" class:big={keyDict[key].length == 1}>{keyDict[key]}</kbd>
		{:else}
			<kbd class="key">{key.toUpperCase()}</kbd>
		{/if}
	{/each}
</span>

<style>
	.top {
		display: flex;
		flex-direction: row;
		gap: 0.3em;
		font-size: inherit;
		align-items: center;
	}
	kbd {
		font-weight: inherit;
		font-family: inherit;
		background: var(--background-indent);
		padding: var(--padding-small);
		border-radius: var(--border-radius-small);
		height: var(--font-size);
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.key {
		font-size: 1em;
	}
	.modifier {
		font-size: 0.8em;
	}

	.modifier.big {
		font-size: 1em;
	}
</style>
