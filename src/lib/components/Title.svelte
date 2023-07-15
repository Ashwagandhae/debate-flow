<script lang="ts">
	import Text from './Text.svelte';
	import Button from './Button.svelte';
	import { flows, selected } from '$lib/models/stores';
	import type { Box } from '../models/types';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { createKeyDownHandler } from '$lib/models/keys';

	const dispatch = createEventDispatcher();

	export let content: string;
	export let children: Box[];
	export let focus: boolean;
	export let invert: boolean;
	export let deleteSelf: () => void = () => {};
	$: path = [];

	let textarea: Text;
	function handleBlur() {
		if (focus) {
			focus = false;
		}
	}
	function handleFocus() {
		if (!focus) {
			focus = true;
		}
	}

	function focusFirstChild() {
		let child = children.find((child) => !child.empty);
		if (child) {
			focus = false;
			child.focus = true;
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
		if (focus) {
			$flows[$selected].history.addFocus([...path]);
			dispatch('saveFocus', path);
			textarea && textarea.focus();
		} else {
			hasSentEdit = false;
		}
	}
	onMount(focusChange);
	$: focus, focusChange();
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
	let palette: string = 'plain';
	$: {
		if (invert) {
			palette = 'accent-secondary';
		} else {
			palette = 'accent';
		}
	}
</script>

<div class={`top`} class:invert>
	<div class={`content palette-${palette}`}>
		<div class="text" class:focus>
			<Text
				on:blur={handleBlur}
				on:focus={handleFocus}
				on:keydown={handleKeydown}
				on:beforeinput={handleBeforeinput}
				bind:value={content}
				bind:this={textarea}
				nowrap
				placeholder="type name here"
			/>
		</div>
		<div class="button">
			<Button
				on:click={deleteSelf}
				icon="trash"
				tooltip="delete flow"
				shortcut={['commandControl', 'shift', 'delete']}
			/>
		</div>
	</div>
</div>

<style>
	.top {
		font-size: 25px;
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
	}
	.text.focus {
		background-color: var(--this-background-active);
		transition: background var(--transition-speed);
	}
	.button {
		padding: var(--padding) 0;
	}
</style>
