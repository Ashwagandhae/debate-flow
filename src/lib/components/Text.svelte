<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { settings } from '$lib/models/settings';

	export let value: string;
	export let placeholder: string = '';
	export let nowrap: boolean = false;
	export let strikethrough: boolean = false;
	export let readonly: boolean = false;
	export let bold: boolean | undefined = undefined;

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
	readonly={readonly}
/>

<style>
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
