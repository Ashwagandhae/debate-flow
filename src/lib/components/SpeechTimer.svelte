<script lang="ts">
	import type { TimeState, TimerSpeech } from '$lib/models/timer';
	import { onMount, tick } from 'svelte';
	import Button from './Button.svelte';
	import Timer from './Timer.svelte';

	export let resetTimeIndex: number;

	export let speeches: TimerSpeech[];

	export let time: number = speeches[resetTimeIndex].time;

	export let state: TimeState;

	let selectedButton: HTMLButtonElement;

	let selectedButtonInit = false;
	function selectedButtonUpdate() {
		if (selectedButton) {
			if (selectedButtonInit) {
				selectedButton.scrollIntoView({
					behavior: 'smooth',
					inline: 'center'
				});
			}
			selectedButtonInit = true;
		}
	}

	onMount(() => {
		setTimeout(() => {
			if (selectedButton) {
				selectedButton.scrollIntoView({
					behavior: 'instant',
					inline: 'center'
				});
			}
		}, 50);
	});

	let resetTimeIndexInit = false;
	async function resetTimeIndexUpdate() {
		if (resetTimeIndexInit) {
			await tick();
			pause();
			reset();
		}
		resetTimeIndexInit = true;
	}

	$: selectedButton, selectedButtonUpdate();
	$: resetTimeIndex, resetTimeIndexUpdate();

	let pause: () => void;
	let reset: () => void;
</script>

<div class="top">
	{#if speeches.length > 1}
		<div class="over">
			<div class="speechesScroll">
				<div class="speeches">
					{#each speeches as speech, index}
						{#if index == resetTimeIndex}
							<button
								class={`speech selected ${
									speech.secondary ? 'palette-accent-secondary' : 'palette-accent'
								}`}
								bind:this={selectedButton}>{speech.name}</button
							>
						{:else}
							<button
								class={`speech ${speech.secondary ? 'palette-accent-secondary' : 'palette-accent'}`}
								on:click={() => {
									resetTimeIndex = index;
								}}
								on:click={() => {
									resetTimeIndex = index;
								}}>{speech.name}</button
							>
						{/if}
					{/each}
				</div>
			</div>
			<Button
				icon={resetTimeIndex == speeches.length - 1 ? 'arrowLeft' : 'arrowRight'}
				palette={speeches[(resetTimeIndex + 1) % speeches.length].secondary
					? 'accent-secondary'
					: 'accent'}
				on:click={() => {
					resetTimeIndex += 1;
					resetTimeIndex %= speeches.length;
				}}
			/>
		</div>
	{/if}

	<div class="timer">
		<Timer
			palette={speeches[resetTimeIndex].secondary ? 'accent-secondary' : 'accent'}
			bind:state
			bind:time
			bind:pause
			bind:reset
			resetTime={speeches[resetTimeIndex].time}
		/>
	</div>
</div>

<style>
	div.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		width: 100%;
		gap: var(--padding);
	}
	div.over {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row;
		width: 100%;
	}
	div.timer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row;
		width: 100%;
	}

	div.speechesScroll {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row;
		width: 100%;
		overflow-x: scroll;
	}

	/* Hide scrollbar for Chrome, Safari and Opera */
	.speechesScroll::-webkit-scrollbar {
		display: none;
	}
	/* Hide scrollbar for IE, Edge and Firefox */
	.speechesScroll {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	div.speeches {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row;
		width: 100%;
	}

	button.speech {
		border: none;
		background: none;
		display: block;
		width: 100%;
		text-align: left;
		border-radius: var(--border-radius);
		color: var(--this-text);
		padding: var(--padding);
		overflow-wrap: break-word;
		transition: background var(--transition-speed), transform var(--transition-speed) ease;
		font-weight: var(--font-weight);
	}

	button:hover {
		background-color: var(--this-background-indent);
	}
	button:active {
		transition: none;
		background-color: var(--this-background-active);
	}
	button.selected {
		background-color: var(--this-background-active);
	}
</style>
