<script lang="ts">
	import Text from './Text.svelte';
	import Button from './Button.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import { flows, selected } from '$lib/models/stores';
	import type { Flow, Box } from '../models/types';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let content: string;
	export let children: Box[];
	export let index: number;
	export let focus: boolean;
	export let invert: boolean;
	export let deleteSelf: () => void = () => {};
	$: path = [index];

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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key == 'Enter' || e.key == 'ArrowDown') {
			e.preventDefault();
			if (children.length > 0) {
				// focus on first non-empty child
				for (let child of children) {
					if (!child.empty) {
						child.focus = true;
						focus = false;
						break;
					}
				}
			}
		}
	}
	let hasSentEdit: boolean = false;
	function focusChange() {
		if (focus) {
			$flows[$selected].history.addFocus([...path]);
			dispatch('saveFocus', path);
			$flows[$selected].lastFocus = [...path];
			$flows[$selected] = $flows[$selected];
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
		<ButtonBar>
			<Button on:click={deleteSelf} icon="delete" tooltip="delete flow" />
		</ButtonBar>
	</div>
</div>

<style>
	.top {
		font-size: 25px;
		display: flex;
		flex-direction: row;
		box-sizing: border-box;
		height: var(--title-height);
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
</style>
