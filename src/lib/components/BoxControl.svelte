<script lang="ts">
	import ButtonBar from './ButtonBar.svelte';
	import { flows, selected, boxFromPath, newBox } from '$lib/models/store';
	import { afterUpdate, onDestroy, tick, type ComponentProps } from 'svelte';
	import type { Flow, Box } from '../models/type';
	import type Button from './Button.svelte';
	import { settings } from '$lib/models/settings';

	export let flow: Flow;

	let disabledReason: string = 'no cell selected';

	let validFocus: boolean = false;
	async function setValidFocus() {
		// wait until its actually done updating
		await tick();
		if (flow.lastFocus && flow.lastFocus.length > 0) {
			let box: Flow | Box | null = boxFromPath(flow, flow.lastFocus);
			validFocus = box?.focus ?? false;
		} else {
			validFocus = false;
		}
	}
	// $: flow.lastFocus, setValidFocus();
	afterUpdate(function () {
		setValidFocus();
	});

	async function deleteBox() {
		// cancel if disabled
		if (!validFocus) return;
		let parent: Box | Flow | null = boxFromPath(flow, flow.lastFocus, 1);
		let target: Box | null = boxFromPath(flow, flow.lastFocus);
		// cancel if parent or target is null
		if (parent == null || target == null) return;
		let childrenClone: Box[] = [...parent.children];
		// if target isn't only child of first level
		if (childrenClone.length > 1 || parent.level >= 1) {
			// add to history
			flow.history.add('deleteBox', flow.lastFocus, {
				box: childrenClone[target.index]
			});
			// unfocus target
			childrenClone[target.index].focus = false;
			parent.children = [...childrenClone];
			flow = flow;
			await tick();

			// delete target
			childrenClone.splice(target.index, 1);
			// fix index
			for (let i = target.index; i < childrenClone.length; i++) {
				childrenClone[i].index = i;
			}
			// focus parent when empty
			if (childrenClone.length <= 0) {
				parent.focus = true;
				// focus last child when last child deleted
			} else if (target.index >= childrenClone.length) {
				childrenClone[childrenClone.length - 1].focus = true;
				// focus next child of deleted
			} else {
				childrenClone[target.index].focus = true;
			}

			parent.children = [...childrenClone];
			flow = flow;
		}
	}

	function addChild() {
		// cancel if disabled
		if (!validFocus) return;
		// if not at end of column
		let target: Box | null = boxFromPath(flow, flow.lastFocus);
		// cancel if target is null
		if (target == null) return;
		let childrenClone: Box[] = [...target.children];
		if (target.level < flow.columns.length) {
			childrenClone.splice(0, 0, newBox(0, target.level + 1, false));
			// fix index
			for (let i = 0; i < childrenClone.length; i++) {
				childrenClone[i].index = i;
			}
			// add to history
			flow.history.add('add', [...flow.lastFocus, 0]);

			target.children = [...childrenClone];
			flow = flow;
		}
	}

	function addSibling(direction: number) {
		// cancel if disabled
		if (!validFocus) return;
		let parent: Flow | Box | null = boxFromPath(flow, flow.lastFocus, 1);
		let target: Box | null = boxFromPath(flow, flow.lastFocus);
		// cancel if parent or target is null
		if (parent == null || target == null) return;

		let childrenClone: Box[] = [...parent.children];
		childrenClone.splice(
			target.index + direction,
			0,
			newBox(target.index + direction, target.level, false)
		);
		// fix index
		for (let i = target.index; i < childrenClone.length; i++) {
			childrenClone[i].index = i;
		}
		// add to history
		let newPath = [...flow.lastFocus];
		if (direction == 0) {
			newPath[newPath.length - 1] -= 0;
			flow.lastFocus[flow.lastFocus.length - 1] += 1;
		} else {
			newPath[newPath.length - 1] += 1;
		}
		flow.history.add('add', newPath);
		parent.children = [...childrenClone];
		flow = flow;
	}
	function toggleCrossed() {
		// cancel if disabled
		if (!validFocus) return;
		let target: Box | null = boxFromPath(flow, flow.lastFocus);
		// cancel if target is null
		if (target == null) return;
		target.crossed = !target.crossed;
		$flows[$selected].history.add('cross', [...flow.lastFocus], {
			crossed: target.crossed
		});
		flow = flow;
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
					disabled: flow.history.index == -1,
					onclick: () => flow.history.undo(),
					tooltip: 'undo',
					shortcut: ['commandControl', 'z'],
					disabledReason: 'nothing to undo'
				},
				{
					disabled: flow.history.index == flow.history.data.length - 1,
					icon: 'redo',
					onclick: () => flow.history.redo(),
					tooltip: 'redo',
					shortcut: ['commandControl', 'shift', 'z'],
					disabledReason: 'nothing to redo'
				}
			],
			showBoxCreationButtons: [
				{
					icon: 'addRight',
					onclick: addChild,
					disabled: !validFocus,
					tooltip: 'add response',
					shortcut: ['shift', 'return'],
					disabledReason
				},
				{
					icon: 'addUp',
					onclick: () => addSibling(0),
					disabled: !validFocus,
					tooltip: 'add arguement above',
					shortcut: ['option', 'return'],
					disabledReason
				},
				{
					icon: 'addDown',
					onclick: () => addSibling(1),
					disabled: !validFocus,
					tooltip: 'add arguement below',
					shortcut: ['return'],
					disabledReason
				},
				{
					icon: 'trash',
					onclick: deleteBox,
					disabled: !validFocus,
					tooltip: 'delete selected',
					shortcut: ['commandControl', 'delete'],
					disabledReason
				}
			],
			showBoxFormatButtons: [
				{
					icon: 'cross',
					onclick: toggleCrossed,
					disabled: !validFocus,
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
	$: validFocus, flow, updateButtonGroups();

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
