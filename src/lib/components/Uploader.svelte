<script lang="ts">
	import Button from './Button.svelte';

	export let closePopup: () => void;

	function openUploadDialog() {
		(document.getElementById('uploadId') as HTMLElement).click();
		closePopup();
	}
</script>

<div class="top">
	<Button
		icon="upload"
		text="choose file from computer"
		tooltip="upload a JSON file from your computer"
		tooltipLayout="top"
		on:click={openUploadDialog}
	/>
	<p>Or drag and drop a JSON file anywhere in this window</p>
</div>

<style>
	.top {
		padding: var(--padding-big);
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		width: min(calc(100vw - var(--padding) * 2), 400px);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--padding-big);
		overflow: scroll;
	}
	p {
		margin: 0;
	}
</style>
