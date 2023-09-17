<script lang="ts">
	import type { TimeState } from '$lib/models/timer';
	import { onDestroy } from 'svelte';

	export let time: number;

	let minutes: string;
	let seconds: string;
	updateMinutesSeconds();

	let minutesElement: HTMLInputElement;
	let secondsElement: HTMLInputElement;

	export let state: TimeState;

	let interval: NodeJS.Timeout | null = null;

	if (state.name == 'running') {
		startInterval();
	}

	export function pause() {
		if (state.name == 'running') {
			if (interval) {
				clearInterval(interval);
			}
			state = { name: 'paused' };
		}
	}

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	function startInterval() {
		interval = setInterval(() => {
			if (state.name != 'running') {
				return;
			}
			time = state.ogTime - (Date.now() - state.startTime);
			if (time <= 0) {
				time = 0;
			}
			updateMinutesSeconds();
		}, 100);
	}
	export function start() {
		state = {
			name: 'running',
			startTime: Date.now(),
			ogTime: time
		};
		startInterval();
	}

	export function set(newTime: number) {
		pause();
		time = newTime;
		updateMinutesSeconds();
	}

	function selectOnFocus(event: FocusEvent) {
		const target = event.target as HTMLInputElement;
		event.preventDefault();
		// select all text on focus
		target.setSelectionRange(0, target.value.length);
	}

	function minutesKey(event: KeyboardEvent) {
		let minutesNum = parseInt(minutes.toString());
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				minutes = (minutesNum + 1).toString();
				updateTime();
				break;
			case 'ArrowDown':
				event.preventDefault();
				minutes = (minutesNum - 1).toString();
				updateTime();
				break;
			case 'ArrowRight':
				event.preventDefault();
				minutesElement.blur();
				secondsElement.focus();
				break;
		}
	}

	function secondsKey(event: KeyboardEvent) {
		let secondsNum = parseInt(seconds.toString());
		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				seconds = (secondsNum + 1).toString();
				updateTime();
				break;
			case 'ArrowDown':
				event.preventDefault();
				seconds = (secondsNum - 1).toString();
				updateTime();
				break;
			case 'ArrowLeft':
				event.preventDefault();
				secondsElement.blur();
				minutesElement.focus();
				break;
		}
	}

	let invalid = false;

	function updateTime() {
		fixMinutesSeconds();
		let minutesNum = parseInt(minutes.toString());
		let secondsNum = parseInt(seconds.toString());

		invalid = false;
		time = minutesNum * 60 * 1000 + secondsNum * 1000;
	}

	function updateMinutesSeconds() {
		let minutesNum = Math.floor(time / (60 * 1000));
		minutes = minutesNum.toString();
		seconds = Math.floor((time - minutesNum * 60 * 1000) / 1000).toString();
		fixMinutesSeconds();
	}

	function fixTime(time: string) {
		let timeNum = parseInt(time.toString());
		let timeString = Math.min(59, Math.max(0, timeNum != timeNum ? 0 : timeNum)).toString();
		return timeString.length == 1 ? '0' + timeString : timeString;
	}
	function fixMinutesSeconds() {
		minutes = fixTime(minutes);
		seconds = fixTime(seconds);
	}
</script>

<div class="time" class:invalid class:done={time == 0 && state.name == 'running'}>
	<input
		type="text"
		bind:value={minutes}
		bind:this={minutesElement}
		style={'--chars: ' + (minutes == null ? 1 : minutes?.toString()?.length ?? 1).toString()}
		class="minutes"
		on:focus={selectOnFocus}
		on:keydown={minutesKey}
		on:change={updateTime}
		disabled={state.name == 'running'}
	/>
	<span>:</span>
	<input
		type="text"
		bind:value={seconds}
		bind:this={secondsElement}
		style={'--chars: ' + (seconds == null ? 1 : seconds?.toString()?.length ?? 1).toString()}
		class="seconds"
		on:focus={selectOnFocus}
		on:keydown={secondsKey}
		on:change={updateTime}
		disabled={state.name == 'running'}
	/>
</div>

<style>
	.time {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: row;
		background: none;
		font-size: 1.5rem;
		color: var(--this-text);
	}
	@keyframes done {
		0% {
			color: var(--this-text);
		}
		50% {
			color: var(--this-color);
		}
		100% {
			color: var(--this-text);
		}
	}
	.done {
		animation: done 1s infinite;
	}
	.time.invalid {
		color: var(--text-error);
	}
	.time input {
		--chars: 2;
		background: none;
		border: none;
		color: inherit;
		padding: 0;
		width: 2ch;
	}
	.minutes {
		text-align: right;
	}
	.seconds {
		text-align: left;
	}
	.time input:focus {
		outline: none;
	}
	/* hide input arrows */
	.time input::-webkit-outer-spin-button,
	.time input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.time input:disabled {
		cursor: not-allowed;
	}
</style>
