<script lang="ts">
	import Text from './Text.svelte';
	import Icon from './Icon.svelte';
	import { getContext, onMount, tick, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { activeMouse, flows, selected, newBox, boxFromPath } from '$lib/models/store';
	import type { Box, Flow } from '$lib/models/type';
	import { createKeyDownHandler, type KeyComboOptionsIndex } from '$lib/models/key';

	import { boxIn, boxOut, boxButtonIn, brIn, brOut } from '../models/transition';

	const dispatch = createEventDispatcher();

	export let root = false;
	export let parentIsEmpty = false;

	export let content: string = '';
	export let children: Box[];
	export let index: number;
	export let level: number;
	export let focus: boolean = false;
	export let parentPath: number[] = [];
	export let empty: boolean = false;
	export let crossed: boolean = false;
	export let placeholder: string = level == 1 && index == 0 ? 'type here' : '';

	$: path = root ? [] : [...parentPath, index];

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
		} else if (childIndex == childFocusIndex) {
			childFocus = false;
			childFocusIndex = -1;
		}
	}
	let hasSentEdit: boolean = false;
	function focusChange() {
		if (focus) {
			dispatchSelfFocus(index, true);
			if (level >= 1) {
				$flows[$selected].history.addFocus([...path]);
				dispatch('saveFocus', path);
				textarea && textarea.focus();
			}
		} else {
			dispatchSelfFocus(index, false);
			hasSentEdit = false;
		}
	}
	onMount(focusChange);
	$: focus, focusChange();

	function pathChange() {
		if (focus) {
			dispatchSelfFocus(index, true);
			$flows[$selected].history.addFocus([...path]);
		}
	}
	$: path, pathChange();

	function preventBlur(e: Event) {
		e.preventDefault();
	}

	function handleFocus() {
		if (!focus) {
			focusSelf();
		}
	}

	function handleBlur() {
		if (focus) {
			focus = false;
		}
	}

	const keyComboOptionsIndex: KeyComboOptionsIndex = {
		'commandControl shift': {
			x: {
				handle: () => crossSelf()
			}
		},
		commandControl: {
			Backspace: {
				handle: () => {
					blurSelf();
					deleteSelf(index);
				}
			}
		},
		alt: {
			Enter: {
				handle: () => {
					blurSelf();
					focusSiblingStrict(index, -1) || (addSibling(index, 0) && focusSibling(index, 0));
				}
			}
		},
		shift: {
			Enter: {
				handle: () => {
					blurSelf();
					addChild(0, 0) && focusChild(0, 0);
				}
			},
			Tab: {
				handle: () => {
					blurSelf();
					focusSibling(index, -1);
				}
			}
		},
		none: {
			Enter: {
				handle: () => {
					blurSelf();
					focusSiblingStrict(index, 1) || (addSibling(index, 1) && focusSibling(index, 1));
				}
			},
			Backspace: {
				handle: () => {
					blurSelf();
					deleteSelf(index);
				},
				// only delete if content is empty and there are no children
				require: () => content.length == 0 && children.length == 0
			},

			ArrowUp: {
				handle: () => {
					blurSelf();
					if (!focusAdjacent(-1)) {
						if (level == 1) {
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
					focusAdjacent(1) || focusSelf();
				}
			},
			Tab: {
				handle: () => {
					blurSelf();
					focusSibling(index, 1);
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
					if (children.length > 0) {
						focusChild(0, 0);
					} else {
						focusSelf();
					}
				}
			}
		}
	};
	let handleKeydown = createKeyDownHandler(keyComboOptionsIndex);
	function handleBeforeinput(e: InputEvent) {
		if (!hasSentEdit) {
			$flows[$selected].history.addPending('edit', [...path], {
				lastContent: content,
				getNextContent: function () {
					return content;
				},
				createEditBreak: function () {
					hasSentEdit = false;
				}
			});
		}
		hasSentEdit = true;
	}

	function crossSelf() {
		crossed = !crossed;
		$flows[$selected].history.add('cross', [...path], {
			crossed: crossed
		});
	}

	function addChild(childIndex: number, direction: number): boolean {
		let newChildIndex = childIndex + direction;
		// if not at end of column
		if (level < columnCount) {
			let childrenClone = [...children];
			childrenClone.splice(newChildIndex, 0, newBox(newChildIndex, level + 1, true));
			// fix childIndex
			for (let i: number = newChildIndex; i < childrenClone.length; i++) {
				childrenClone[i].index = i;
			}
			// add to history
			$flows[$selected].history.add('add', [...path, newChildIndex]);

			children = [...childrenClone];
			return true;
		} else {
			// stay focused
			focusSelf();
			return false;
		}
	}
	async function deleteChild(childIndex: number) {
		// if target isn't only child of first level
		if (children.length > 1 || level >= 1) {
			// delete self if empty
			if (empty && children.length == 1) {
				deleteSelf(index);
				return;
			}
			let childrenClone = [...children];
			// add to history
			$flows[$selected].history.add('deleteBox', [...path, childIndex], {
				box: childrenClone[childIndex]
			});
			// unfocus target
			childrenClone[childIndex].focus = false;
			children = [...childrenClone];
			await tick();

			// delete target
			childrenClone.splice(childIndex, 1);
			// fix childIndex
			for (let i = 0; i < childrenClone.length; i++) {
				childrenClone[i].index = i;
			}
			children = [...childrenClone];
			// focus on previous child of deleted
			if (children[childIndex - 1]) {
				focusChild(childIndex - 1, 0);
				// focus on parent when empty
			} else if (children.length == 0) {
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
		//TODO fix focusChild
		let newChildIndex = childIndex + direction;
		// focus on parent when childIndex is before children
		if (newChildIndex < 0) {
			focusSelf();
			return;
		}
		// if childIndex is beyond children
		if (newChildIndex >= children.length) {
			// if has grandchild
			if (children[children.length - 1].children.length > 0) {
				// focus on first grandchild that isn't empty
				let grandChild = children[children.length - 1].children[0];
				grandChild.focus = true;
			} else {
				// stay focused
				children[childIndex].focus = true;
			}
		} else {
			// if is empty, skip
			if (children[newChildIndex].empty && direction != 0) {
				focusChild(newChildIndex, direction);
			} else {
				// focus on child
				children[newChildIndex].focus = true;
			}
		}
		children = children;
	}
	function focusChildStrict(childIndex: number, direction: number): boolean {
		let newChildIndex = childIndex + direction;
		if (newChildIndex < 0 || newChildIndex >= children.length) {
			return false;
		}
		// if is empty, skip
		if (children[newChildIndex].empty && direction != 0) {
			return focusChildStrict(newChildIndex, direction);
		} else {
			// focus on child
			children[newChildIndex].focus = true;
			children = children;
			return true;
		}
	}
	function reducePath(path: number[]): number[] | null {
		if (path.length == 0) return null;
		let last = path[path.length - 1];
		if (last == 0) {
			let parentPath: number[] | null = path.slice(0, path.length - 1);
			while (true) {
				// reduce parent path
				parentPath = reducePath(parentPath);
				// if no parent, return null
				if (parentPath == null) return null;
				let box = boxFromPath($flows[$selected], parentPath) as Box;
				// if parent has last child, return parent path with last child
				if (box.children.length > 0) {
					return [...parentPath, box.children.length - 1];
				}
				// if parent has no children, keep reducing parentPath
			}
			// if no last child, return parent path
		}
		return [...path.slice(0, path.length - 1), last - 1];
	}
	function increasePath(path: number[]): number[] | null {
		if (path.length == 0) return null;
		let last = path[path.length - 1];
		let parentBox = boxFromPath($flows[$selected], path.slice(0, path.length - 1)) as Box;
		if (last == parentBox.children.length - 1) {
			let parentPath: number[] | null = path.slice(0, path.length - 1);
			while (true) {
				// increase parent path
				parentPath = increasePath(parentPath);
				// if no parent, return null
				if (parentPath == null) return null;
				let box = boxFromPath($flows[$selected], parentPath) as Box;
				// if parent has last child, return parent path with last child
				if (box.children.length > 0) {
					return [...parentPath, 0];
				}
				// if parent has no children, keep increasing parentPath
			}
			// if no last child, return parent path
		}
		return [...path.slice(0, path.length - 1), last + 1];
	}
	function focusAdjacent(direction: number): boolean {
		let retPath: number[] | null = [...path];
		while (true) {
			// change path
			if (direction == -1) {
				retPath = reducePath(retPath);
			} else if (direction == 1) {
				retPath = increasePath(retPath);
			}
			if (retPath == null) return false;
			// get box
			let box = boxFromPath($flows[$selected], retPath) as Box;
			if (box == null) return false;
			if (box.empty) {
				// skip if empty
				continue;
			} else {
				// if not empty, focus on box
				box.focus = true;
				return true;
			}
		}
	}
	function focusSelf() {
		if (empty) {
			focusParent();
		} else {
			focus = true;
		}
	}
	function blurSelf() {
		focus = false;
	}
	let palette: string;
	$: {
		if ((level % 2 == 0 && !invert) || (level % 2 == 1 && invert)) {
			palette = 'accent-secondary';
		} else {
			palette = 'accent';
		}
	}
	let outsidePalette: string;
	$: {
		if ((level % 2 == 0 && !invert) || (level % 2 == 1 && invert)) {
			outsidePalette = 'accent';
		} else {
			outsidePalette = 'accent-secondary';
		}
	}
</script>

<div
	class={`top palette-${palette}`}
	class:childless={children.length == 0}
	class:empty
	class:focus
	class:childFocus
	class:activeMouse={$activeMouse}
	class:highlight={childFocus || focus}
	in:boxIn={{ skip: root }}
	out:boxOut={{ skip: root }}
>
	{#if empty}
		<div class="content" />
	{:else}
		<div
			class="content"
			class:root
			style={`--this-background: ${backgroundColor}`}
			class:left={children.length > 0}
			class:right={index == 0 && level > 1 && !parentIsEmpty}
		>
			<div class="barcontainer">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<!-- we can ignore accesibility because you can use keyboard inside the cell for same function -->
				<div
					class="line above"
					class:left={children.length > 0}
					class:right={index == 0 && level > 1 && !parentIsEmpty}
					in:brIn
					out:brOut
					on:click={() => {
						addSibling(index, 0) && focusSibling(index, 0);
					}}
					on:mousedown={preventBlur}
					role="separator"
				/>

				<div class="text" class:crossed>
					<Text
						on:keydown={handleKeydown}
						on:beforeinput={handleBeforeinput}
						on:blur={handleBlur}
						on:focus={handleFocus}
						bind:value={content}
						bind:this={textarea}
						{placeholder}
					/>
				</div>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<!-- we can ignore accesibility because you can use keyboard inside the cell for same function -->
				<div
					class="line below"
					in:brIn
					out:brOut
					on:click={() => {
						addSibling(index, 1) && focusSibling(index, 1);
					}}
					on:mousedown={preventBlur}
					role="separator"
				/>
			</div>
			{#if children.length == 0 && level < columnCount}
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
		</div>
	{/if}

	<ul class="children">
		{#each children as child, _ (child)}
			<svelte:self
				bind:content={child.content}
				bind:children={child.children}
				bind:index={child.index}
				bind:level={child.level}
				bind:focus={child.focus}
				bind:empty={child.empty}
				bind:placeholder={child.placeholder}
				bind:crossed={child.crossed}
				addSibling={addChild}
				deleteSelf={deleteChild}
				focusSibling={focusChild}
				focusSiblingStrict={focusChildStrict}
				focusParent={focusSelf}
				dispatchSelfFocus={onChildFocus}
				parentPath={path}
				parentIsEmpty={empty}
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
	.add {
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
	.focus > .content > .add,
	.activeMouse .add:hover {
		opacity: 1;
	}
	.activeMouse .add:hover {
		background-color: var(--this-background-indent);
	}
	.add:active,
	.activeMouse .add:active {
		background-color: var(--this-background-active);
	}
</style>
