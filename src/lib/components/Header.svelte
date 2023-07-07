<script lang="ts">
	import Button from './Button.svelte';
	export let column: string;
	export let addEmpty: () => void;
</script>

<div class="top">
	<div class="text">
		{column}
	</div>
	<div class="add">
		<Button icon="add" on:click={addEmpty} />
	</div>
</div>

<style>
	.top {
		position: relative;
		width: var(--column-width);
		height: calc(var(--button-size) + var(--padding) * 2);
		text-align: center;
		box-sizing: border-box;
		user-select: none;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
	}
	.text {
		padding: var(--padding);
	}
	.add {
		position: absolute;
		right: 0;
		opacity: 0;
		overflow: show;
		transition: opacity var(--transition-speed);
	}
	.top:hover .add {
		opacity: 1;
	}
</style>
