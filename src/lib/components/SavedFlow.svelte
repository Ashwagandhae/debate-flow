<script lang="ts">
	import Button from './Button.svelte';
	import {
		deleteNodes,
		loadSavedNodes,
		type SavedNodesData,
		downloadSavedNodes
	} from '$lib/models/autoSave';
	import { hiddenButtons, savedFlow } from '$lib/models/transition';
	import { settings } from '$lib/models/settings';

	function prettyDate(date: string) {
		const today = new Date();
		const dateObj = new Date(date);
		if (
			today.getDate() === dateObj.getDate() &&
			today.getMonth() === dateObj.getMonth() &&
			today.getFullYear() === dateObj.getFullYear()
		) {
			return dateObj.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: 'numeric',
				hour12: true
			});
		} else {
			return dateObj.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		}
	}
	export let flowData: SavedNodesData;
	export let key: string;

	let showHidden = false;
</script>

<div class="flow" transition:savedFlow>
	<div class="infoView" class:customScrollbar={settings.data.customScrollbar.value}>
		<div class="infos">
			{#each flowData.flowInfos as info}
				<div
					class="info"
					class:palette-accent={!info.invert}
					class:palette-accent-secondary={info.invert}
				>
					{info.content}
				</div>
			{/each}
		</div>
	</div>
	<div class="fixed">
		<div class="times">
			<div class="time">
				{prettyDate(flowData.modified)}
			</div>
		</div>
		<div class="flowButtons">
			<!-- TODO: add undo/redo for deleteing whole tabs -->
			<!-- TODO: drag to resize sidebar-->
			<Button
				icon="open"
				text="open"
				on:click={() => {
					loadSavedNodes(key, true);
				}}
			/>
			<Button
				icon={showHidden ? 'delete' : 'ellipses'}
				on:click={() => (showHidden = !showHidden)}
			/>
			{#if showHidden}
				<div class="hidden" transition:hiddenButtons>
					<div class="time">created {prettyDate(flowData.created)}</div>
					<div class="time">edited {prettyDate(flowData.modified)}</div>
					<Button
						icon="copy"
						text={'open copy'}
						tooltip={'save changes in new'}
						on:click={() => {
							loadSavedNodes(key, false);
						}}
					/>
					<Button
						icon="download"
						text={'download'}
						tooltip={'download as JSON'}
						on:click={() => {
							downloadSavedNodes(key);
						}}
					/>

					<Button
						icon="trash"
						text={'delete'}
						tooltip={'delete flow data'}
						on:click={() => {
							deleteNodes(key);
						}}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.flow {
		display: grid;
		flex-direction: row;
		width: 100%;
		position: relative;
		grid-template-columns: 1fr auto;
		gap: var(--padding);
	}
	.infoView {
		overflow-x: scroll;
		position: relative;
		border-radius: var(--border-radius);
	}
	.infos {
		display: flex;
		flex-direction: row;
		width: max-content;
		gap: var(--padding);
	}
	.info {
		padding: var(--padding);
		border-radius: var(--border-radius);
		background-color: var(--this-background-indent);
		color: var(--this-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		height: var(--button-size);
		display: flex;
		align-items: center;
	}
	.fixed {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
	}
	.times {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.time {
		padding: var(--padding);
		border-radius: var(--border-radius);
		color: var(--this-text);
		background-color: var(--background-indent);
		height: var(--button-size);
		display: flex;
		align-items: center;
		white-space: nowrap;
	}
	.hidden > .time {
		background: none;
	}
	.flowButtons {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
	}

	.hidden {
		z-index: 900;
		position: absolute;
		top: calc(var(--button-size) + var(--padding) * 2);
		right: calc(-1 * var(--padding));
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--padding);
		padding: var(--padding);
		background: var(--background-back);
		border-radius: var(--border-radius);
	}
</style>
