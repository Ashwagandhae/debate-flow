<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { settings } from '$lib/models/settings';
	import { toSegments, type BoldRange } from '$lib/models/boldRange';

	export let value: string;
	export let placeholder: string = '';
	export let nowrap: boolean = false;
	export let strikethrough: boolean = false;
	export let readonly: boolean = false;
	export let bold: boolean | undefined = undefined;
	export let boldRanges: BoldRange[] | undefined = undefined;

	export let textHeight = 0; // Should be readonly at higher levels
	let whiteSpaceCss: string;
	$: {
		if (nowrap) {
			whiteSpaceCss = 'nowrap';
		} else {
			whiteSpaceCss = 'auto';
		}
	}
	let textarea: HTMLTextAreaElement;

	// overlay only kicks in when there are inline bold ranges; the plain
	// whole-box bold path is left untouched so normal cells render as before
	$: hasRanges = (boldRanges?.length ?? 0) > 0;
	$: segments = hasRanges ? toSegments(value, boldRanges ?? [], bold === true) : [];

	// selection offsets so the parent can bold the selected range
	export function getSelection(): { start: number; end: number } {
		return { start: textarea.selectionStart, end: textarea.selectionEnd };
	}
	export function setSelection(start: number, end: number) {
		textarea.setSelectionRange(start, end);
	}

	let lastValue: string | undefined;
	let lastBold: boolean | undefined;
	export function autoHeight(force?: boolean) {
		if (textarea && (lastValue !== value || lastBold !== bold || force)) {
			textarea.value = textarea.value.replace(/\r?\n|\r/g, '');
			textarea.style.height = '0px';
			textHeight = textarea.scrollHeight;
			textarea.style.height = textHeight + 'px';

			lastValue = value;
			lastBold = bold;
		}
	}
	onDestroy(settings.subscribe(['fontSize'], () => autoHeight(true)));
	onMount(() => {requestAnimationFrame(() => autoHeight())});
	export const focus = () => {
		// only focus if not already focused
		textarea.focus();
	};
</script>

<div class="textWrap">
	{#if hasRanges}
		<div class="mirror" style={`--white-space:${nowrap ? 'pre' : 'pre-wrap'};`} aria-hidden="true">
			{#each segments as seg}<span class:bold={seg.bold}>{seg.text}</span>{/each}
		</div>
	{/if}
	<textarea
		bind:value
		bind:this={textarea}
		on:load
		on:input={() => requestAnimationFrame(() => autoHeight())}
		on:beforeinput
		on:keydown
		on:focus
		on:blur
		spellcheck="false"
		{placeholder}
		style={`--white-space:${whiteSpaceCss};`}
		class:strikethrough
		class:transparentText={hasRanges}
		readonly={readonly}
	/>
</div>

<style>
	.textWrap {
		position: relative;
		width: 100%;
	}
	textarea {
		box-sizing: border-box;
		resize: none;
		outline: none;
		display: block;
		overflow-y: hidden;
		margin: 0;
		line-height: 1.5em;

		width: 100%;
		height: calc(1em + var(--padding) * 2 + 6px);

		background: none;
		padding: 0;
		border: none;
		border-radius: 0;
		font-size: inherit;
		color: inherit;
		white-space: var(--white-space);
		text-decoration: inherit;
	}
	/* hide the glyphs but keep the caret and selection highlight visible */
	textarea.transparentText {
		-webkit-text-fill-color: transparent;
	}

	.mirror {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		border: none;
		line-height: 1.5em;
		font-size: inherit;
		color: inherit;
		white-space: var(--white-space);
		word-break: break-word;
		overflow-wrap: break-word;
		text-decoration: inherit;
		pointer-events: none;
		z-index: 1;
	}
	.mirror .bold {
		font-weight: var(--font-weight-bold);
	}

	textarea::-webkit-scrollbar {
		display: none;
	}
	textarea {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	textarea:focus {
		z-index: 10000;
	}
	textarea::placeholder {
		color: var(--this-text-weak);
	}
	textarea::selection {
		background: var(--this-text-select);
	}
</style>
