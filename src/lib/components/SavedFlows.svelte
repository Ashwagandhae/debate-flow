<script lang="ts">
	import { MAX_SAVED_FLOWS, type SavedNodesDatas } from '$lib/models/autoSave';
	import { settings } from '$lib/models/settings';
	import Button from './Button.svelte';
	import SavedFlow from './SavedFlow.svelte';

	export let savedFlowsDatas: SavedNodesDatas;
	export let showTutorial: boolean = false;

	$: sortedSavedFlowsDatas = Object.entries(savedFlowsDatas).sort(
		(a, b) => new Date(b[1].modified).getTime() - new Date(a[1].modified).getTime()
	);
</script>

<div class="top">
	<div class="above">
		<div class="title">
			<h1>saved flows</h1>
			<Button
				text="tutorial"
				icon="undo"
				tooltip="start tutorial"
				on:click={() => (showTutorial = true)}
			/>
		</div>
		<p>
			up to {MAX_SAVED_FLOWS} flows saved in your browser but lost when you clear cookies
		</p>
	</div>
	<div class="view" class:customScrollbar={settings.data.customScrollbar.value}>
		<div class="flows">
			{#each sortedSavedFlowsDatas as [key, flowData] (key)}
				<SavedFlow {flowData} {key} />
			{/each}
		</div>
	</div>
</div>

<style>
	.top {
		padding: 0;
		margin: 0;
		border: none;
		background: none;
		height: 100%;
		width: 100%;
		color: inherit;
		text-align: left;

		border-radius: var(--border-radius);
		background-color: var(--background);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		min-width: 38ch;

		gap: var(--padding);
	}
	.view {
		overflow-y: auto;
	}
	.flows {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		padding: 0 var(--padding) 50vh var(--padding);
	}
	h1 {
		margin: 0;
		padding: 0;
		line-height: 1em;
		white-space: nowrap;
	}
	p {
		margin: 0;
		padding: 0;
		line-height: 1em;
		white-space: nowrap;
		/* ellipses overflow */
		overflow: hidden;
		text-overflow: ellipsis;
		color: var(--text-weak);
	}
	.above {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		height: calc(var(--button-size) + var(--padding) * 4);
		padding: 0 var(--padding);
		gap: var(--padding);
		box-sizing: border-box;
	}
	.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding);
	}
</style>
