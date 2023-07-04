<script lang="ts">
	import Icon from '../Icon.svelte';

	export let icon: string;
	export let text: string;
</script>

<button class="top">
	<Icon name={icon} size="var(--button-size)" />
	{#if text != null}
		<p>{text}</p>
	{/if}
</button>

<style>
	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding-small);

		box-sizing: content-box;
		padding: var(--padding);
		width: max-content;
		min-width: var(--button-size);
		height: var(--button-size);

		border: none;
		background: none;
		margin: 0;
		text-align: left;
		border-radius: var(--border-radius);
		font-weight: var(--font-weight);
		color: var(--this-text);
		transition: background var(--transition-speed);
		background-color: var(--background-indent);
	}
</style>
