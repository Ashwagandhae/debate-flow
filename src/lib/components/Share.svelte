<script lang="ts">
	import Button from './Button.svelte';
	import TextInput from './TextInput.svelte';
</script>

<div class="top palette-plain">
	<h1>Sharing</h1>
	<p>Coming soon</p>
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 500px);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		padding: var(--padding-big);
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: auto;
		gap: var(--padding);
	}
</style>
