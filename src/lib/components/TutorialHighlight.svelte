<script lang="ts">
	import { tutorialStep } from '$lib/models/store';
	export let step: number | number[] | null = null;
	let stepList: number[];
	if (typeof step === 'number') {
		stepList = [step];
	} else if (step === null) {
		stepList = [];
	} else {
		stepList = step;
	}
	$: show = stepList.includes($tutorialStep);
</script>

{#if show}
	<div class="tutorialHighlight">
		<slot />
	</div>
{:else}
	<slot />
{/if}

<style>
	@keyframes pulsate {
		0% {
			box-shadow: 0 0 0 var(--padding-small) var(--text-weak) inset;
		}
		50% {
			box-shadow: 0 0 0 var(--padding-small) var(--text) inset;
		}
		100% {
			box-shadow: 0 0 0 var(--padding-small) var(--text-weak) inset;
		}
	}
	.tutorialHighlight {
		display: block;
		width: min-content;
		height: min-content;
		border-radius: var(--border-radius);
		animation: pulsate 2s infinite;
	}
</style>
