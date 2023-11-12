<script lang="ts">
	import Button from './Button.svelte';
	import { popupIn, popupOut } from '../models/transition';
	export let component: any;
	export let props: any = {};
	export let title: string;
	export let closeSelf: () => void;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeSelf();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="top" in:popupIn|global out:popupOut|global>
	<div class="upper">
		<Button icon="delete" tooltip="close" palette="plain-secondary" on:click={closeSelf} /><span
			>{title}</span
		>
	</div>
	<svelte:component this={component} closePopup={closeSelf} {...props} />
</div>

<style>
	.top {
		background: var(--background);
		display: block;
		position: absolute;
		border-radius: var(--border-radius);
		overflow: hidden;
	}
	.upper {
		position: absolute;
		display: flex;
		align-items: center;
		flex-direction: row;
		gap: var(--padding-small);
	}
	span {
		font-weight: bold;
	}
</style>
