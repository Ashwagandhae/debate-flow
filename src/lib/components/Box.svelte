<script lang="ts">
	import Text from './Text.svelte';
	import Icon from './Icon.svelte';
	import { getContext, onMount, tick } from 'svelte';
	import { activeMouse, nodes, pendingAction } from '$lib/models/store';
	import {
		type BoxId,
		type FlowId,
		type Box,
		type Node,
		type Flow,
		getParentFlowId,
		checkIdBox,
		getAdjacentBox,
		getNode
	} from '$lib/models/node';
	import { createKeyDownHandler, type KeyComboOptionsIndex } from '$lib/models/key';

	import { boxIn, boxOut, boxButtonIn, brIn, brOut } from '../models/transition';
	import { history } from '$lib/models/history';
	import { focusId } from '$lib/models/focus';
	import {
		addNewBox,
		deleteBox,
		newUpdateAction,
		toggleBoxFormat
	} from '$lib/models/nodeDecorateAction';
	import { settings } from '$lib/models/settings';
	import { folded } from '$lib/models/fold';
	import Tooltip from './Tooltip.svelte';
	import Fold from './Fold.svelte';

	export let id: BoxId | FlowId;
	export let parentIsEmpty = false;

	let consistentEnterBehaviour: boolean = settings.data['consistentEnterBehaviour']
		.value as boolean;

	let node: Node<Box | Flow>;
	let box: Box | null;
	// TODO make updates more percise, don't update all boxes when one changes (do the same for focusId, basically ban stores from box)
	$: $nodes, updateNodeData();
	function updateNodeData() {
		// hold onto box and index value when it's deleted
		let newNode = $nodes[id];
		if (newNode != null) {
			node = newNode;
			if (node.value.tag == 'flow') {
				box = null;
			} else {
				box = node.value;
				// update text height in case it changes, for example due to bold
				updateTextHeight && updateTextHeight();
			}
		}
	}

	let lastValidIndex: number;
	function index() {
		let parentNode = $nodes[node.parent];
		if (parentNode == null) return lastValidIndex;
		lastValidIndex = (<BoxId[]>parentNode.children).indexOf(<BoxId>id);
		return lastValidIndex;
	}

	export let addSibling: (childIndex: number, direction: number) => boolean = () => false;
	export let deleteSelf: (childIndex: number) => void = () => {};
	export let focusSibling: (childIndex: number, direction: number) => void = () => {};
	export let focusSiblingStrict: (childIndex: number, direction: number) => boolean = () => false;
	export let focusParent: () => void = () => {};
	export let dispatchSelfFocus: (childIndex: number, isFocused: boolean) => void = () => {};

	const getInvert: () => boolean = getContext('invert');
	let invert: boolean = getInvert();

	const getColumnCount: () => number = getContext('columnCount');
	let columnCount: number = getColumnCount();

	let textarea: any = undefined;

	let backgroundColor: string;
	let childFocus: boolean = false;
	let childFocusIndex: number = -1;
	function onChildFocus(childIndex: number, isFocused: boolean) {
		if (isFocused) {
			childFocus = true;
			childFocusIndex = childIndex;
			unfold();
		} else if (childIndex == childFocusIndex) {
			childFocus = false;
			childFocusIndex = -1;
		}
	}

	let lastFocus = $focusId;
	function focusChange() {
		if ($focusId == id) {
			dispatchSelfFocus(index(), true);
			if (node.level >= 1) {
				textarea && textarea.focus();
			}
		} else if (lastFocus == id) {
			dispatchSelfFocus(index(), false);
		}
		lastFocus = $focusId;
	}
	onMount(focusChange);
	$: $focusId, focusChange();

	function handleBlur() {
		if ($focusId == id) {
			$focusId = null;
		}
	}
	function handleFocus() {
		if ($focusId != id) {
			$focusId = id;
		}
	}

	const keyComboOptionsIndex: KeyComboOptionsIndex = {
		'commandControl shift': {
			x: {
				handle: () => formatSelf('crossed')
			}
		},
		commandControl: {
			Backspace: {
				handle: () => {
					blurSelf();
					deleteSelf(index());
					history.setPrevAfterFocus($focusId);
				}
			},
			b: {
				handle: () => formatSelf('bold')
			}
		},
		alt: {
			Enter: {
				handle: () => {
					if (consistentEnterBehaviour) {
						if (addSibling(index(), 0)) {
							focusSibling(index(), 0);
							history.setPrevAfterFocus($focusId);
						}
					} else {
						blurSelf();
						if (focusSiblingStrict(index(), -1)) return;
						if (addSibling(index(), 0)) {
							focusSibling(index(), 0);
							history.setPrevAfterFocus($focusId);
						}
					}
				}
			}
		},
		shift: {
			Enter: {
				handle: () => {
					blurSelf();
					if (addChild(0, 0)) {
						focusChild(0, 0);
						history.setPrevAfterFocus($focusId);
					}
				}
			},
			Tab: {
				handle: () => {
					blurSelf();
					focusSibling(index(), -1);
				}
			}
		},
		none: {
			Enter: {
				handle: () => {
					if (consistentEnterBehaviour) {
						if (addSibling(index(), 1)) {
							focusSibling(index(), 1);
							history.setPrevAfterFocus($focusId);
						}
					} else {
						blurSelf();
						if (focusSiblingStrict(index(), 1)) return;
						if (addSibling(index(), 1)) {
							focusSibling(index(), 1);
							history.setPrevAfterFocus($focusId);
						}
					}
				}
			},
			Backspace: {
				handle: () => {
					blurSelf();
					deleteSelf(index());
					history.setPrevAfterFocus($focusId);
				},
				// only delete if content is empty and there are no children
				require: () => (content?.length ?? 1) == 0 && node.children.length == 0
			},

			ArrowUp: {
				handle: () => {
					blurSelf();
					if (!focusAdjacent('up')) {
						if (node.level == 1) {
							focusParent();
						} else {
							focusSelf();
						}
					}
				}
			},
			ArrowDown: {
				handle: () => {
					blurSelf();
					focusAdjacent('down') || focusSelf();
				}
			},
			Tab: {
				handle: () => {
					blurSelf();
					focusSibling(index(), 1);
				}
			},
			ArrowLeft: {
				handle: () => {
					blurSelf;
					focusParent();
				}
			},
			ArrowRight: {
				handle: () => {
					blurSelf();
					if (node.children.length > 0) {
						focusChild(0, 0);
					} else {
						focusSelf();
					}
				}
			}
		},
		control: {
			l: {
				handle: () => {
					if (!isFolded && node.children.length == 0) {
						return;
					}
					toggleFold();
				}
			}
		}
	};
	let handleKeydown = createKeyDownHandler(keyComboOptionsIndex);

	function formatSelf(format: Parameters<typeof toggleBoxFormat>[1]) {
		const boxId = checkIdBox($nodes, id);
		if (boxId == null) return;
		toggleBoxFormat(boxId, format);
		updateNodeData();
	}

	function addChild(childIndex: number, direction: number): boolean {
		let newChildIndex = childIndex + direction;
		// if not at end of column
		if (node.level < columnCount) {
			addNewBox(id, newChildIndex);
			// node = node;
			return true;
		} else {
			// stay focused
			focusSelf();
			return false;
		}
	}
	async function deleteChild(childIndex: number) {
		// if target isn't only child of first level
		if (node.children.length > 1 || node.level >= 1) {
			// delete self if empty
			if (box?.empty && node.children.length == 1) {
				deleteSelf(index());
				return;
			}

			let deleteId = node.children[childIndex];

			// unfocus target
			if ($focusId == deleteId) {
				$focusId = null;
			}
			await tick();

			deleteBox(deleteId);
			// node = node;
			// focus on previous child of deleted
			if (node.children[childIndex - 1]) {
				focusChild(childIndex - 1, 0);
				// focus on parent when empty
			} else if (node.children.length == 0) {
				focusSelf();
				// focus on first child if deleted first child
			} else if (childIndex == 0) {
				focusChild(0, 0);
			}
			return true;
		} else {
			focusChild(0, 0);
			return false;
		}
	}
	function focusChild(childIndex: number, direction: number) {
		let newChildIndex = childIndex + direction;
		// focus on parent when childIndex is before children
		if (newChildIndex < 0) {
			focusSelf();
			return;
		}
		// if childIndex is beyond children
		if (newChildIndex >= node.children.length) {
			// if has grandchild
			let lastChild = $nodes[node.children[node.children.length - 1]];
			if (lastChild == null) return;
			if (lastChild.children.length > 0) {
				// focus on first grandchild that isn't empty
				let grandChildId = lastChild.children[0];
				$focusId = grandChildId;
			} else {
				// stay focused
				$focusId = id;
			}
		} else {
			// if is empty, skip
			let child = $nodes[node.children[newChildIndex]];
			if (child == null) return;
			if (child.value.empty && direction != 0) {
				focusChild(newChildIndex, direction);
			} else {
				// focus on child
				$focusId = node.children[newChildIndex];
			}
		}
		// node = node;
	}
	// only focus direct child
	function focusChildStrict(childIndex: number, direction: number): boolean {
		let newChildIndex = childIndex + direction;
		if (newChildIndex < 0 || newChildIndex >= node.children.length) {
			return false;
		}
		// if is empty, skip
		let child = $nodes[node.children[newChildIndex]];
		if (child == null) return false;
		if (child.value.empty && direction != 0) {
			return focusChildStrict(newChildIndex, direction);
		} else {
			// focus on child
			$focusId = node.children[newChildIndex];
			// node = node;
			return true;
		}
	}

	function focusAdjacent(direction: 'up' | 'down'): boolean {
		let boxId = checkIdBox($nodes, id);
		if (boxId == null) return false;
		while (true) {
			let adjacentBox = getAdjacentBox($nodes, boxId, direction);
			if (adjacentBox == null) return false;
			if (getNode($nodes, adjacentBox).unwrap().value.empty) {
				// skip if empty
				boxId = adjacentBox;
				continue;
			} else {
				// if not empty, focus on box
				$focusId = adjacentBox;
				return true;
			}
		}
	}
	function focusSelf() {
		if (box?.empty) {
			focusParent();
		} else {
			$focusId = id;
		}
	}
	function blurSelf() {
		if ($focusId == id) {
			$focusId = null;
		}
	}
	let palette: string;
	let outsidePalette: string;
	$: {
		if ((node.level % 2 == 0 && !invert) || (node.level % 2 == 1 && invert)) {
			palette = 'accent-secondary';
			outsidePalette = 'accent';
		} else {
			palette = 'accent';
			outsidePalette = 'accent-secondary';
		}
	}
	function preventBlur(e: Event) {
		e.preventDefault();
	}

	$: box, syncNodesToContent();
	let content: string;
	function syncNodesToContent() {
		if (box == null) return;
		if (content != box.content) {
			content = box.content;
		}
	}

	let editAlreadyPending: boolean = false;
	function handleBeforeInput() {
		if (editAlreadyPending) return;
		editAlreadyPending = true;
		$pendingAction = {
			beforeFocusId: id,
			afterFocusId: id,
			ownerId: getParentFlowId($nodes, id).unwrap(),
			action: function () {
				if (box == null) return { tag: 'identity' };
				const boxId = checkIdBox($nodes, id);
				if (boxId == null) return { tag: 'identity' };
				editAlreadyPending = false;
				return newUpdateAction(boxId, { ...box, content });
			}
		};
	}

	function getIsFolded(folded: Map<BoxId, boolean>): boolean {
		let boxId = checkIdBox($nodes, id);
		if (boxId == null) return false;
		return folded.get(boxId) ?? false;
	}

	$: isFolded = getIsFolded($folded);

	function toggleFold() {
		let boxId = checkIdBox($nodes, id);
		if (boxId == null) return;
		let foldState = $folded.get(boxId) ?? false;
		$folded.set(boxId, !foldState);
		$folded = $folded;
	}

	function unfold() {
		let boxId = checkIdBox($nodes, id);
		if (boxId == null) return;
		$folded.delete(boxId);
		$folded = $folded;
	}

	let updateTextHeight: (() => void) | undefined = undefined;
</script>

<div
	class={`box top palette-${palette}`}
	class:childless={node.children.length == 0}
	class:empty={box?.empty}
	class:focus={$focusId == id}
	class:childFocus
	class:activeMouse={$activeMouse}
	class:highlight={childFocus || $focusId == id}
	in:boxIn={{ skip: box == null }}
	out:boxOut={{ skip: box == null }}
>
	{#if box?.empty}
		<div class="content" />
	{:else}
		<div
			class="content"
			class:root={box == null}
			style={`--this-background: ${backgroundColor}`}
			class:left={node.children.length > 0}
			class:right={index() == 0 && node.level > 1 && !parentIsEmpty}
		>
			<div class="barcontainer">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<!-- we can ignore accesibility because you can use keyboard inside the cell for same function -->
				<div
					class="line above"
					class:left={node.children.length > 0}
					class:right={index() == 0 && node.level > 1 && !parentIsEmpty}
					in:brIn
					out:brOut
					on:click={() => {
						let couldAdd = addSibling(index(), 0);
						if (couldAdd) {
							focusSibling(index(), 0);
							history.setPrevAfterFocus($focusId);
						}
					}}
					on:mousedown={preventBlur}
					role="separator"
				/>

				<div class="text" class:crossed={box?.crossed} class:bold={box?.bold}>
					{#if box != null}
						<Text
							on:keydown={handleKeydown}
							on:blur={handleBlur}
							on:focus={handleFocus}
							bind:value={content}
							bind:this={textarea}
							on:beforeinput={handleBeforeInput}
							bind:autoHeight={updateTextHeight}
							placeholder={box.placeholder ?? (node.level == 1 && index() == 0 ? 'type here' : '')}
						/>
					{/if}
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<!-- we can ignore accesibility because you can use keyboard inside the cell for same function -->
				<div
					class="line below"
					in:brIn
					out:brOut
					on:click={() => {
						let couldAdd = addSibling(index(), 1);
						if (couldAdd) {
							focusSibling(index(), 1);
							history.setPrevAfterFocus($focusId);
						}
					}}
					on:mousedown={preventBlur}
					role="separator"
				/>
			</div>
			{#if !isFolded && node.children.length == 0 && node.level < columnCount}
				<button
					class={`add palette-${outsidePalette}`}
					on:click={() => {
						addChild(0, 0);
						focusChild(0, 0);
					}}
					on:mousedown={preventBlur}
					in:boxButtonIn
				>
					<Icon name="add" />
				</button>
			{/if}
			{#if isFolded}
				<button
					class={`unfoldButton foldParent palette-${outsidePalette}`}
					on:click={unfold}
					on:mousedown={preventBlur}
				>
					<Fold />
				</button>
			{/if}
		</div>
	{/if}

	<ul class="children" class:isFolded>
		{#each node.children as childId, _ (childId)}
			<svelte:self
				id={childId}
				addSibling={addChild}
				deleteSelf={deleteChild}
				focusSibling={focusChild}
				focusSiblingStrict={focusChildStrict}
				focusParent={focusSelf}
				dispatchSelfFocus={onChildFocus}
				parentIsEmpty={box?.empty ?? false}
				on:saveFocus
			/>
		{/each}
	</ul>
</div>

<style>
	.top {
		display: grid;
		grid-template-areas: 'a b';
		grid-template-rows: min-content;
		width: max-content;
		height: auto;
		overflow: visible;
		align-items: start;
	}

	.content {
		width: var(--column-width);
		height: min-content;
		flex-direction: row;
		display: flex;
		grid-area: a;
		background: var(--this-background);
		transition: background var(--transition-speed);
		position: relative;
		border-radius: var(--border-radius-small);
		color: var(--this-text);
	}

	.empty > .content {
		pointer-events: none;
		height: 10px;
		opacity: 0;
	}
	.text {
		padding: var(--padding);
		position: relative;
	}
	.text.crossed {
		text-decoration: line-through;
		color: var(--this-text-weak);
	}
	.text.bold {
		font-weight: var(--font-weight-bold);
	}

	.childFocus > .content,
	.activeMouse .content:hover {
		background: var(--this-background-indent);
	}
	:is(.focus, .activeMouse.focus) > .content {
		background: var(--this-background-active);
	}
	.content.left {
		border-radius: var(--border-radius-small) 0 var(--border-radius-small)
			var(--border-radius-small);
	}
	.content.right {
		border-radius: 0 var(--border-radius-small) var(--border-radius-small)
			var(--border-radius-small);
	}
	.content.left.right {
		border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
	}
	.childless .content {
		width: max-content;
	}
	.root.content {
		display: none;
	}
	.line {
		z-index: -1;
	}
	.line {
		content: '';
		display: block;
		background-color: var(--this-background-indent);
		height: var(--line-width);
		margin-left: var(--padding);
		width: calc(var(--column-width) - var(--padding) * 2);
		border-radius: var(--border-radius-small);
		margin-top: calc(-0.5 * var(--line-width));
		position: absolute;
		transition: width var(--transition-speed), margin var(--transition-speed),
			background var(--transition-speed);
	}
	.line.below {
		margin-top: calc(-0.5 * var(--line-width));
	}
	.line.left {
		width: calc(var(--column-width) - var(--padding));
		border-radius: 3px 0 0 3px;
	}
	.line.right {
		width: calc(var(--column-width) - var(--padding));
		margin-left: 0;
		border-radius: 0 3px 3px 0;
	}
	.line.left.right,
	.activeMouse .line:hover {
		width: calc(var(--column-width));
		border-radius: 0;
		margin-left: 0;
	}
	.childFocus > .content > .barcontainer > .line,
	.activeMouse .content:hover > .barcontainer > .line {
		z-index: 2;

		background-color: var(--this-color-fade);
	}
	:is(.focus, .focus.activeMouse) > .content > .barcontainer > .line {
		z-index: 3;
		background-color: var(--this-color);
	}

	.barcontainer {
		width: var(--column-width);
	}
	.children {
		grid-area: b;
		width: max-content;
		padding: 0;
		margin: 0;
	}
	.children.isFolded {
		height: 0;
		overflow: hidden;
	}
	.add,
	.unfoldButton {
		opacity: 0;
		transition: background var(--transition-speed);
		border: none;
		display: block;
		position: absolute;
		transform: translateX(var(--column-width));
		border-radius: var(--border-radius);
		padding: var(--padding);
		margin: var(--padding-small) var(--padding) 0 var(--padding);
		width: calc(var(--column-width) - var(--padding) * 2);
		background-color: var(--this-background);
		box-sizing: border-box;
		height: calc(1em + var(--padding) * 2);
		color: var(--this-text);
	}

	.unfoldButton {
		opacity: 1;
		width: calc(var(--button-size) + var(--padding) * 2);
		height: calc(100% - var(--padding));
		margin: 0;
		margin-top: var(--padding-small);
		padding: 0 var(--padding);
		border-radius: 0 var(--border-radius) var(--border-radius) 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}
	.focus > .content > .add,
	.focus > .content > .unfoldButton,
	.activeMouse .add:hover,
	.activeMouse .unfoldButton:hover {
		opacity: 1;
	}

	.activeMouse .add:hover,
	.activeMouse .unfoldButton:hover {
		background-color: var(--this-background-indent);
	}
	.add:active,
	.activeMouse .add:active,
	.unfoldButton:active,
	.activeMouse .unfoldButton:active {
		background-color: var(--this-background-active);
	}
</style>
