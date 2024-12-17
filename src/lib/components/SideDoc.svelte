<script lang="ts">
	import { sideDocText } from '$lib/models/store';
</script>

<div class="document">
	<textarea class="text" placeholder="type notes here" bind:value={$sideDocText} />
</div>

<style>
	.document {
		background: var(--background);
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	.text {
		height: 100%;
		width: 100%;

		outline: none;
		margin: none;

		overflow-y: scroll;

		line-height: 1.5em;
		font-size: 0.9rem;

		background: none;
		border: none;
		color: inherit;
		text-decoration: inherit;
		box-sizing: border-box;

		resize: none;
		padding: var(--padding);
		padding-bottom: calc(var(--main-height) * 0.6);
	}

	.text::placeholder {
		color: var(--text-weak);
	}
</style>
