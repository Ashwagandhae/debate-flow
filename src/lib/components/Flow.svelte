<script lang="ts">
	import Box from './Box.svelte';
	import Header from './Header.svelte';
	import type { FlowId, Node, Flow } from '../models/node';

	import { setContext } from 'svelte';
	import { focusId } from '$lib/models/focus';
	import { nodes } from '$lib/models/store';
	import { addNewEmpty } from '$lib/models/nodeDecorateAction';
	import { settings } from '$lib/models/settings';

	export let flowId: FlowId;
	let node: Node<Flow>;
	$: {
		// hold onto node when it's deleted
		if ($nodes[flowId] != null) {
			node = $nodes[flowId];
		}
	}
	$: flow = node.value;

	setContext('invert', () => {
		return flow.invert;
	});
	setContext('columnCount', () => {
		return flow.columns.length;
	});

	function addEmpty(column: number) {
		let id = addNewEmpty(flowId, column);
		$focusId = id;
	}
</script>

<div class="top" class:invert={flow.invert} style={`--column-count: ${flow.columns.length};`}>
	<div class="viewer">
		<div class="content" class:customScrollbar={settings.data.customScrollbar.value}>
			<Box id={flowId} />
		</div>
		<div class="headers">
			{#each flow.columns as column, index}
				<div
					class={`header palette-${!!(index % 2) == flow.invert ? 'accent' : 'accent-secondary'}`}
				>
					<Header {column} on:focusFlow addEmpty={() => addEmpty(index)} />
				</div>
			{/each}
		</div>
		<div class="columns">
			{#each flow.columns as col, index}
				<div
					class={`column palette-${!!(index % 2) == flow.invert ? 'plain' : 'plain-secondary'}`}
				/>
			{/each}
		</div>
	</div>
</div>

<style>
	.top {
		width: calc(var(--column-width) * var(--column-count));
		overflow: hidden;
	}
	.top {
		--this-background: var(--background-secondary);
		--this-background-secondary: var(--background);
		--this-accent-text: var(--accent-secondary-text);
		--this-accent-secondary-text: var(--accent-text);
	}
	.top.invert {
		--this-background: var(--background);
		--this-background-secondary: var(--background-secondary);
		--this-accent-text: var(--accent-text);
		--this-accent-secondary-text: var(--accent-secondary-text);
	}
	.viewer {
		position: relative;
		width: max-content;
		margin: auto;
		height: var(--view-height);
		overflow: hidden;
		display: flex;
		flex-direction: row;
	}
	.headers {
		position: relative;
		display: flex;
		flex-direction: row;
		width: auto;
		z-index: 3;
		height: 2.4em;
		transform: translateX(-100%);
		background: var(--background);
	}
	.header {
		border-radius: var(--border-radius) var(--border-radius) 0 0;
		background: var(--this-background);
		color: var(--this-text);
	}

	.columns {
		position: relative;
		display: flex;
		flex-direction: row;
		width: max-content;
		height: var(--view-height);
		transform: translateX(-200%);
		pointer-events: none;
		z-index: -2;
	}
	.column {
		height: 100%;
		width: var(--column-width);
		border-radius: var(--border-radius);
		background-color: var(--this-background);
	}

	.content {
		padding-bottom: calc(var(--view-height) * 0.6);
		padding-top: calc(2.4em + var(--padding));
		width: calc(var(--column-width) * var(--column-count));
		height: var(--view-height);
		overflow-x: clip;
		overflow-y: auto;
		box-sizing: border-box;
	}
</style>
