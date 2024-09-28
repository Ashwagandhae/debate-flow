<script lang="ts">
	import Text from './Text.svelte';
	import Button from './Button.svelte';
	import type { FlowId, Node, Flow } from '../models/node';
	import { onMount, tick } from 'svelte';
	import { createKeyDownHandler } from '$lib/models/key';
	import { focusId } from '$lib/models/focus';
	import { history } from '$lib/models/history';
	import { nodes, pendingAction } from '$lib/models/store';
	import { newUpdateAction } from '$lib/models/nodeDecorateAction';
	import { settings } from '$lib/models/settings';

	export let flowId: FlowId;
	export let deleteSelf: () => void = () => {};

	let node: Node<Flow>;
	$: {
		// hold onto node when it's deleted
		let newNode = $nodes[flowId];
		if (newNode != null) {
			node = newNode;
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
		let childId = node.children.find((childId) => {
			const child = $nodes[childId];
			return child && !child.value.empty;
		});
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

	let editAlreadyPending: boolean = false;
	function handleBeforeInput() {
		if (editAlreadyPending) return;
		editAlreadyPending = true;
		$pendingAction = {
			beforeFocusId: flowId,
			afterFocusId: flowId,
			ownerId: flowId,
			action: function () {
				editAlreadyPending = false;
				return newUpdateAction(flowId, { ...flow, content });
			}
		};
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
            <Button on:click={settings.saveToLocalStorage} icon="download" tooltip="save to local storage" />
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
