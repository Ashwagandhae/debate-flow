<script lang="ts">
	import ButtonBar from './ButtonBar.svelte';
	import { afterUpdate, onDestroy, tick, type ComponentProps } from 'svelte';
	import {
		type FlowId,
		nodes,
		deleteBox,
		checkIdBox,
		addNewBox,
		updateBox,
		type BoxId
	} from '../models/node';
	import type Button from './Button.svelte';
	import { settings } from '$lib/models/settings';
	import { history } from '$lib/models/history';
	import { focusId, lastFocusIds, selectedFlowId } from '$lib/models/focus';

	export let flowId: FlowId;

	let disabledReason: string = 'no cell selected';

	let targetId: BoxId | null = null;
	async function setValidTargetId() {
		// wait until its actually done updating
		await tick();
		targetId = checkIdBox($nodes, $lastFocusIds[flowId]);
	}
	afterUpdate(function () {
		setValidTargetId();
	});

	async function deleteBoxAndFocus() {
		if (targetId == null) return;
		let target = $nodes[targetId];
		let parent = $nodes[target.parent];
		// if target isn't only child of first level
		if (target.children.length > 1 || parent.level >= 1) {
			// unfocus target
			$focusId = null;
			$nodes = $nodes;

			let targetIndex = $nodes[target.parent].children.indexOf(targetId);
			await tick();

			// delete target
			deleteBox($nodes, targetId);
			// focus parent when empty
			if (target.children.length <= 0) {
				$focusId = target.parent;
			}
			// focus last child when last child deleted
			else if (targetIndex >= parent.children.length) {
				$focusId = parent.children[parent.children.length - 1];
			}
			// focus next child of deleted
			else {
				$focusId = parent.children[targetIndex];
			}
			history.setPrevAfterFocus($focusId);
			$nodes = $nodes;
		}
	}

	function addChild() {
		if (targetId == null) return;
		if ($selectedFlowId == null) return;
		let target = $nodes[targetId];
		// if not at end of column
		if (target.level < $nodes[$selectedFlowId].value.columns.length) {
			addNewBox($nodes, targetId, 0);
			$nodes = $nodes;
		}
	}

	function addSibling(direction: number) {
		if (targetId == null) return;
		let target = $nodes[targetId];
		let parent = $nodes[target.parent];

		let targetIndex = parent.children.indexOf(targetId);
		let newBoxIndex = targetIndex + direction;
		addNewBox($nodes, target.parent, newBoxIndex);

		$nodes = $nodes;
	}
	function toggleCrossed() {
		if (targetId == null) return;
		let target = $nodes[targetId];
		let value = structuredClone(target.value);
		value.crossed = !value.crossed;
		updateBox($nodes, targetId, value);
		$nodes = $nodes;
	}
	function preventBlur(e: Event) {
		e.preventDefault();
	}

	let buttonGroups: { [key: string]: ComponentProps<Button>[] } = getButtonGroups();
	function getButtonGroups() {
		return {
			showUndoRedoButtons: [
				{
					icon: 'undo',
					disabled: !history.canUndo(flowId),
					onclick: () => {
						history.undo($nodes, flowId);
						$nodes = $nodes;
					},
					tooltip: 'undo',
					shortcut: ['commandControl', 'z'],
					disabledReason: 'nothing to undo'
				},
				{
					disabled: !history.canRedo(flowId),
					icon: 'redo',
					onclick: () => {
						history.redo($nodes, flowId);
						$nodes = $nodes;
					},
					tooltip: 'redo',
					shortcut: ['commandControl', 'shift', 'z'],
					disabledReason: 'nothing to redo'
				}
			],
			showBoxCreationButtons: [
				{
					icon: 'addRight',
					onclick: addChild,
					disabled: targetId == null,
					tooltip: 'add response',
					shortcut: ['shift', 'return'],
					disabledReason
				},
				{
					icon: 'addUp',
					onclick: () => addSibling(0),
					disabled: targetId == null,
					tooltip: 'add argument above',
					shortcut: ['option', 'return'],
					disabledReason
				},
				{
					icon: 'addDown',
					onclick: () => addSibling(1),
					disabled: targetId == null,
					tooltip: 'add argument below',
					shortcut: ['return'],
					disabledReason
				},
				{
					icon: 'trash',
					onclick: deleteBoxAndFocus,
					disabled: targetId == null,
					tooltip: 'delete selected',
					shortcut: ['commandControl', 'delete'],
					disabledReason
				}
			],
			showBoxFormatButtons: [
				{
					icon: 'cross',
					onclick: toggleCrossed,
					disabled: targetId == null,
					tooltip: 'toggle crossed out',
					shortcut: ['commandControl', 'x'],
					disabledReason
				}
			]
		};
	}
	function updateButtonGroups() {
		buttonGroups = getButtonGroups();
	}
	$: targetId, $nodes, updateButtonGroups();

	let buttonGroupsShow: { [key: string]: boolean } = {};
	for (let key of Object.keys(buttonGroups)) {
		buttonGroupsShow[key] = settings.data[key].value as boolean;
	}
	onDestroy(
		settings.subscribe(Object.keys(buttonGroups), (key: string) => {
			buttonGroupsShow[key] = settings.data[key].value as boolean;
			buttonGroupsShow = buttonGroupsShow;
		})
	);

	let showButtons: ComponentProps<Button>[];
	let hideButtons: ComponentProps<Button>[];
	function updateButtonLists() {
		showButtons = [];
		hideButtons = [];
		for (let key of Object.keys(buttonGroups)) {
			if (buttonGroupsShow[key]) {
				showButtons = [...showButtons, ...buttonGroups[key]];
			} else {
				hideButtons = [...hideButtons, ...buttonGroups[key]];
			}
		}
	}
	$: buttonGroups, buttonGroupsShow, updateButtonLists();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- this isn't an actual interaction, its just preventing blur -->
<div class="top" on:mousedown={preventBlur}>
	<ButtonBar buttons={[...showButtons, ...hideButtons]} showCount={showButtons.length} />
</div>

<style>
	.top {
		padding: var(--padding);
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
		height: var(--title-height);
		width: auto;
		position: relative;
	}
</style>
