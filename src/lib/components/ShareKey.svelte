<script lang="ts">
	import Text from './Text.svelte';

	export let message: string | null = null;
	export let content: string;
	export let editable: boolean;
</script>

<code>
	{#if message != null}
		<div class="message">{message}</div>
	{:else if editable}
		<textarea bind:value={content} />
	{:else}
		<div class="text">
			{content}
		</div>
	{/if}
</code>

<style>
	code {
		/* break all words */
		word-break: break-all;
		background: var(--this-background-indent);
		font-family: var(--font-family);
		border-radius: var(--border-radius);
		height: 7rem;
		width: 100%;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	.message {
		color: var(--this-text-weak);
	}
	textarea,
	.text {
		color: var(--this-text);
		font-size: 0.6rem;

		box-sizing: border-box;
		resize: none;
		outline: none;
		display: block;
		margin: 0;
		line-height: 1.5em;
		overflow: scroll;

		width: 100%;
		background: none;
		padding: 0;
		border: none;
		border-radius: 0;
		text-decoration: inherit;
		height: 100%;
		padding: var(--padding);
	}
</style>
