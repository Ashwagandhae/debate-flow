<script lang="ts">
	export let value: string = '';
	export let placeholder: string = '';
	export let type: string = 'text';
</script>

<!-- evil hack to make svelte accept type -->
<input {...{ type }} bind:value {placeholder} />

<style>
	input {
		width: 100%;
		padding: var(--padding);
		box-sizing: border-box;
		background: var(--background-indent);
		border: none;
		border-radius: var(--border-radius);
		color: var(--text);
	}
	input:focus {
		outline: none;
		background: var(--background-active);
	}
	input::placeholder {
		color: var(--text-weak);
	}
</style>
