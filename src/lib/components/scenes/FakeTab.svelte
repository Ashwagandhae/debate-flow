<script lang="ts">
	export let text: string;
</script>

<div class="top">
	<button class:selected={false} on:click>
		{text}
	</button>
</div>

<style>
	div {
		padding-bottom: var(--padding);
		height: auto;
		box-sizing: content-box;
	}
	button {
		border: none;
		background: none;
		display: block;
		width: 100%;
		text-align: left;
		border-radius: var(--border-radius);
		color: var(--this-text);
		padding: var(--padding);
		overflow-wrap: break-word;
		transition: background var(--transition-speed), transform var(--transition-speed) ease;
		font-weight: var(--font-weight);
		background-color: var(--this-background-indent);

		width: var(--tab-width);
	}
	:global(.hover) button {
		background-color: var(--this-background-active);
	}
</style>
