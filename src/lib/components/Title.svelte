<script lang="ts">
	import Text from './Text.svelte';
	import Button from './Button.svelte';
	import {
		type FlowId,
		nodes,
		type Node,
		type Flow,
		addPendingAction,
		getNode,
		updateWithoutResolve
	} from '../models/node';
	import { onMount, tick } from 'svelte';
	import { createKeyDownHandler } from '$lib/models/key';
	import { focusId } from '$lib/models/focus';
	import { history } from '$lib/models/history';

	export let flowId: FlowId;
	export let deleteSelf: () => void = () => {};

	let node: Node<Flow>;
	$: {
		// hold onto node when it's deleted
		if ($nodes[flowId] != null) {
			node = $nodes[flowId];
		}
	}
	$: flow = node.value;

	let textarea: Text;
	function handleBlur() {
		if ($focusId == flowId) {
			$focusId = null;
		}
	}
	async function handleFocus() {
		await tick();
		if ($focusId != flowId) {
			$focusId = flowId;
		}
	}

	function focusFirstChild() {
		let childId = $nodes[flowId].children.find((childId) => !$nodes[childId].value.empty);
		if (childId) {
			$focusId = childId;
		}
	}

	const handleKeydown = createKeyDownHandler({
		none: {
			Enter: {
				handle: focusFirstChild
			},
			ArrowDown: {
				handle: focusFirstChild
			},
			ArrowRight: {
				handle: focusFirstChild
			}
		}
	});

	let hasSentEdit: boolean = false;
	function focusChange() {
		if ($focusId == flowId) {
			textarea && textarea.focus();
		}
	}
	onMount(focusChange);
	$: $focusId, focusChange();

	$: flow, syncNodesToContent();
	let content: string;
	function syncNodesToContent() {
		if (content != flow.content) {
			content = flow.content;
		}
	}
	function handleBeforeInput() {
		if (hasSentEdit) return;
		hasSentEdit = true;
		addPendingAction(function (nodes) {
			if (flow == null) return;
			let value = { ...flow, content };
			let flowIdRes = getNode(nodes, flowId);
			if (!flowIdRes.ok) return;
			history.setNextBeforeFocus(flowId, flowId);
			updateWithoutResolve(nodes, flowId, value);
			history.setPrevAfterFocus(flowId, flowId);
			nodes = nodes;
			hasSentEdit = false;
		});
	}

	let palette: string = 'plain';
	$: {
		if (flow.invert) {
			palette = 'accent-secondary';
		} else {
			palette = 'accent';
		}
	}
</script>

<div class={`top`} class:invert={flow.invert}>
	<div class={`content palette-${palette}`}>
		<div class="text" class:focus={flowId == $focusId}>
			<Text
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:keydown={handleKeydown}
				on:beforeinput={handleBeforeInput}
				bind:value={content}
				bind:this={textarea}
				nowrap
				placeholder="type name here"
			/>
		</div>
		<div class="button">
			<Button on:click={deleteSelf} icon="trash" tooltip="delete flow" />
		</div>
	</div>
</div>

<style>
	.top {
		font-size: 1.5rem;
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
		height: var(--title-height);
		min-width: 15ch;
	}
	.content {
		width: 100%;
		color: var(--this-text);
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		padding-right: var(--padding);
	}
	.text {
		padding: var(--padding) var(--padding);
		border-radius: var(--border-radius);

		width: 100%;
		transition: background var(--transition-speed);
	}
	.text.focus {
		background-color: var(--this-background-active);
	}
	.button {
		padding: var(--padding) 0;
	}
</style>
