<script lang="ts">
	import ButtonBar from './ButtonBar.svelte';
	import { afterUpdate, onDestroy, tick, type ComponentProps } from 'svelte';
	import { type FlowId, type BoxId, checkIdBox, type Box, type Node } from '../models/node';
	import type Button from './Button.svelte';
	import { settings } from '$lib/models/settings';
	import { history } from '$lib/models/history';
	import { focusId, lastFocusIds, selectedFlowId } from '$lib/models/focus';
	import { nodes, pendingAction } from '$lib/models/store';
	import { addNewBox, deleteBox, toggleBoxFormat } from '$lib/models/nodeDecorateAction';
	import { folded } from '$lib/models/fold';

	export let flowId: FlowId;

	let disabledReason: string = 'no cell selected';

	let targetId: BoxId | null = null;
	async function setValidTargetId() {
		// wait until its actually done updating
		await tick();
		if ($focusId == null) {
			targetId = null;
			return;
		}
		targetId = checkIdBox($nodes, $lastFocusIds[flowId]);
	}
	afterUpdate(function () {
		setValidTargetId();
	});

	function targetBox(): Node<Box> | null {
		if (targetId == null) return null;
		let target = $nodes[targetId];
		if (target == null) return null;
		return target;
	}

	async function deleteBoxAndFocus() {
		if (targetId == null) return;
		let target = $nodes[targetId];
		if (target == null) return;
		let parent = $nodes[target.parent];
		if (parent == null) return;
		// if target isn't only child of first level
		if (target.children.length > 1 || parent.level >= 1) {
			// unfocus target
			$focusId = null;

			let targetIndex = parent.children.indexOf(targetId);
			await tick();

			// delete target
			deleteBox(targetId);
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
		}
	}

	function addChild() {
		if (targetId == null) return;
		if ($selectedFlowId == null) return;
		let target = $nodes[targetId];
		if (target == null) return;
		let currentFlow = $nodes[$selectedFlowId];
		if (currentFlow == null) return;
		// if not at end of column
		if (target.level < currentFlow.value.columns.length) {
			addNewBox(targetId, 0);
		}
	}

	function addSibling(direction: number) {
		if (targetId == null) return;
		let target = $nodes[targetId];
		if (target == null) return;
		let parent = $nodes[target.parent];
		if (parent == null) return;

		let targetIndex = parent.children.indexOf(targetId);
		let newBoxIndex = targetIndex + direction;
		addNewBox(target.parent, newBoxIndex);
	}
	function toggleFormat(format: Parameters<typeof toggleBoxFormat>[1]) {
		if (targetId == null) return;
		toggleBoxFormat(targetId, format);
	}
	function toggleFold() {
		if (targetId == null) return;
		if ($folded.get(targetId)) {
			$folded.delete(targetId);
		} else {
			$folded.set(targetId, true);
		}
		$folded = $folded;
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
					disabled: !history.canUndo(flowId, $pendingAction),
					onclick: () => {
						history.undo(flowId, $pendingAction);
					},
					tooltip: 'undo',
					shortcut: ['commandControl', 'z'],
					disabledReason: 'nothing to undo'
				},
				{
					disabled: !history.canRedo(flowId, $pendingAction),
					icon: 'redo',
					onclick: () => {
						history.redo(flowId, $pendingAction);
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
					onclick: () => toggleFormat('crossed'),
					disabled: targetId == null,
					tooltip: 'toggle crossed out',
					shortcut: ['commandControl', 'shift', 'x'],
					toggled: targetBox()?.value?.crossed,
					disabledReason
				},
				{
					icon: 'letterB',
					onclick: () => toggleFormat('bold'),
					disabled: targetId == null,
					tooltip: 'toggle bold',
					shortcut: ['commandControl', 'b'],
					toggled: targetBox()?.value?.bold,
					disabledReason
				},
				{
					icon: 'foldArrows',
					onclick: () => toggleFold(),
					disabled: targetId == null || targetBox()?.children?.length === 0,
					tooltip: 'toggle folded',
					shortcut: ['control', 'l'],
					toggled: targetId != null && $folded.get(targetId),
					disabledReason:
						targetBox()?.children?.length === 0 ? 'no children to fold' : disabledReason
				}
			]
		};
	}
	function updateButtonGroups() {
		buttonGroups = getButtonGroups();
	}
	$: targetId, $nodes, $pendingAction, $folded, updateButtonGroups();

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
