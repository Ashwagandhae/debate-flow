<script lang="ts">
	import Icon from './Icon.svelte';
	import { onMount } from 'svelte';
	import { settings } from '$lib/models/settings';
	import { fade } from 'svelte/transition';

	let transitionSpeed: number = settings.data['transitionSpeed'].value as number;

	onMount(() => {
		settings.subscribe(['transitionSpeed'], (key: string) => {
			transitionSpeed = settings.data[key].value as number;
		});
	});

	let delay = transitionSpeed * 2;
</script>

<div class="top">
	<div class="instruction" in:fade|global={{ duration: transitionSpeed, delay: 0 }}>
		<Icon name="arrowLeft" />
		<p>
			click to go <span class="primary">home</span>, go to <span class="primary">settings</span>,
			and to <span class="secondary">download/upload</span>
		</p>
	</div>
	<div class="instruction" in:fade|global={{ duration: transitionSpeed, delay }}>
		<Icon name="arrowLeft" />
		<p>
			click to create a new flow on <span class="primary">aff</span> or
			<span class="secondary">neg</span>
		</p>
	</div>
	<div class="tips" in:fade|global={{ duration: transitionSpeed, delay: delay * 2 }}>
		<h1>Tips</h1>
		<div class="instruction" in:fade|global={{ duration: transitionSpeed, delay: delay * 3 }}>
			<Icon name="dots" />
			<p><span class="primary">hover</span> over buttons to see what they do</p>
		</div>
		<div class="instruction" in:fade|global={{ duration: transitionSpeed, delay: delay * 4 }}>
			<Icon name="undo" />
			<p>
				use <span class="secondary">undo</span> and
				<span class="secondary">redo</span> if you make a mistake
			</p>
		</div>
		<div class="instruction" in:fade|global={{ duration: transitionSpeed, delay: delay * 5 }}>
			<Icon name="settings" />
			<p>
				click on <span class="primary">settings</span> to customize
			</p>
		</div>
	</div>
</div>

<style>
	.top {
		height: 100%;
		width: 100%;
		border-radius: var(--border-radius);
		background-color: var(--background);
		padding: var(--padding);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
	.instruction {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding-small);

		box-sizing: content-box;
		padding: var(--padding);
		width: max-content;
		min-width: var(--button-size);
		height: var(--button-size);

		border: none;
		background: none;
		margin: 0;
		text-align: left;
		border-radius: var(--border-radius);
		font-weight: var(--font-weight);
		color: var(--this-text);
		transition: background var(--transition-speed);
	}
	p {
		display: block;
		color: var(--text);
	}
	.primary {
		color: var(--text-accent);
	}
	.secondary {
		color: var(--text-accent-secondary);
	}
	.tips {
		display: flex;
		flex-direction: column;
		padding: var(--padding);
		background: var(--background-indent);
		border-radius: var(--border-radius);
		width: min-content;
	}
</style>
