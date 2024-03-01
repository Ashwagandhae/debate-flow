<script lang="ts">
	import { nodes, resolveAllPending } from '$lib/models/node';
	import Button from './Button.svelte';
	import { downloadJson, downloadXlsx } from '$lib/models/file';

	export let closePopup: () => void;

	function openUploadDialog() {
		(document.getElementById('uploadId') as HTMLElement).click();
		closePopup();
	}
</script>

<div class="top">
	<section class="download">
		<Button
			icon="download"
			text="download as JSON"
			tooltip="saves JSON file on your computer"
			tooltipLayout="top"
			on:click={() => {
				resolveAllPending($nodes);
				downloadJson($nodes);
				closePopup();
			}}
			disabled={$nodes.root.children.length == 0}
			disabledReason={'nothing to download'}
			palette="accent"
		/>
		<ul>
			<li>Can reopen file in this editor</li>
			<li>More data is saved (last focused cell etc.)</li>
		</ul>
		<Button
			icon="download"
			text="download as XLSX"
			tooltip="saves XLSX file on your computer"
			tooltipLayout="top"
			on:click={() => {
				resolveAllPending($nodes);
				downloadXlsx($nodes);
				closePopup();
			}}
			disabled={$nodes.root.children.length == 0}
			disabledReason={'nothing to download'}
			palette="accent-secondary"
		/>
		<ul>
			<li>Anyone can view it</li>
		</ul>
	</section>
	<section class="upload">
		<Button
			icon="upload"
			text="choose file from computer"
			tooltip="upload a JSON file from your computer"
			tooltipLayout="top"
			on:click={openUploadDialog}
			palette="accent"
		/>
		<p>Or drag and drop a JSON file anywhere in this window</p>
	</section>
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 500px);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 1fr 1fr;
		overflow: auto;
	}
	ul {
		line-height: 1.6em;
		margin: 0;
		padding-left: var(--padding-big);
		color: var(--color-subtle);
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}
	p {
		margin: 0;
		padding: 0;
		color: var(--color-subtle);
		text-align: center;
	}

	section {
		width: 100%;
		padding: var(--padding-big);
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);
	}
	.upload {
		background: var(--background-secondary);
	}
</style>
