<script lang="ts">
	import type { TimeState } from '$lib/models/timer';
	import Button from './Button.svelte';
	import Time from './Time.svelte';

	export let resetTime: number;

	export let time: number = resetTime;
	export let state: TimeState;
	let startTime: () => void;
	let pauseTime: () => void;
	let setTime: (time: number) => void;

	export function start() {
		startTime();
	}

	export function pause() {
		pauseTime();
	}

	export function reset() {
		setTime(resetTime);
	}

	export let palette: string = 'plain';
</script>

<div class="top palette-{palette}">
	{#if state?.name == 'running'}
		<Button icon="pause" on:click={pause} preventBlur={false} />
	{:else}
		<Button icon="play" on:click={start} preventBlur={false} />
	{/if}
	<Time bind:start={startTime} bind:pause={pauseTime} bind:set={setTime} bind:state bind:time />
	<Button
		icon="arrowRoundLeft"
		on:click={() => reset()}
		disabled={time == resetTime}
		preventBlur={false}
	/>
</div>

<style>
	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row;
		width: 100%;
	}
</style>
