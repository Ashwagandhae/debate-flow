<script lang="ts">
	import Timer from './Timer.svelte';
	import SpeechTimer from './SpeechTimer.svelte';
	import Button from './Button.svelte';
	import type { TimerState, SpeechTimerState, TimerSpeech } from '$lib/models/timer';
	import { timer } from '$lib/models/transition';
	import { settings } from '$lib/models/settings';
	import { onDestroy, tick } from 'svelte';
	import { debateStyles, debateStyleMap, type DebateStyle } from '$lib/models/debateStyle';

	let states: {
		prep?: TimerState;
		prepSecondary?: TimerState;
		speech: SpeechTimerState;
	};

	let showTimers = false;

	let update = false;

	let debateStyleIndex = settings.data['debateStyle'].value as number;
	let debateStyle: DebateStyle = debateStyles[debateStyleMap[debateStyleIndex]];
	onDestroy(
		settings.subscribe(['debateStyle'], (key: string) => {
			let newDebateStyleIndex = settings.data[key].value as number;
			if (newDebateStyleIndex === debateStyleIndex) return;
			debateStyleIndex = newDebateStyleIndex;
			debateStyle = debateStyles[debateStyleMap[debateStyleIndex]];
			resetStates();
			update = !update;
		})
	);

	function resetStates() {
		let newStates: typeof states = {
			speech: {
				resetTimeIndex: 0,
				time: debateStyle?.timerSpeeches[0].time,
				state: { name: 'paused' }
			}
		};
		if (debateStyle?.prepTime != null) {
			newStates.prep = {
				resetTime: debateStyle.prepTime,
				time: debateStyle.prepTime,
				state: { name: 'paused' }
			};
			newStates.prepSecondary = {
				resetTime: debateStyle.prepTime,
				time: debateStyle.prepTime,
				state: { name: 'paused' }
			};
		}
		states = newStates;
	}

	resetStates();
</script>

<div class="top">
	{#key update}
		{#if showTimers}
			<div class="timer" transition:timer>
				{#if states.prep}
					<Timer
						resetTime={states.prep.resetTime}
						bind:time={states.prep.time}
						bind:state={states.prep.state}
						palette={'accent'}
					/>
				{/if}
				{#if states.prepSecondary}
					<Timer
						resetTime={states.prepSecondary.resetTime}
						bind:time={states.prepSecondary.time}
						bind:state={states.prepSecondary.state}
						palette={'accent-secondary'}
					/>
				{/if}
				<SpeechTimer
					speeches={debateStyle.timerSpeeches}
					bind:resetTimeIndex={states.speech.resetTimeIndex}
					bind:time={states.speech.time}
					bind:state={states.speech.state}
				/>
			</div>
		{/if}
	{/key}
	<div class="buttons">
		<Button icon={showTimers ? 'delete' : 'clock'} on:click={() => (showTimers = !showTimers)} />
	</div>
</div>

<style>
	div.top {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
	.timer {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		width: 100%;
		height: auto;
	}
	.buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
</style>
