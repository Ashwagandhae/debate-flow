<script lang="ts">
	import Button from './Button.svelte';
	import {
		initHostConnection,
		initGuestConnection,
		giveGuestHostKey,
		giveHostGuestKey,
		connection,
		disconnect
	} from '$lib/models/sharingConnection';
	import ShareKey from './ShareKey.svelte';
	import { instructionIn, instructionOut } from '$lib/models/transition';

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}

	let hostKey: string = '';
	let guestKey: string = '';

	const hostInstructions: string[] = [
		'copy the host key',
		"send the host key to the person you're sharing with (through email, discord, etc.)",
		"wait until they've sent back a guest key",
		'submit the guest key in the guest key box and connect!'
	];
	const guestInstructions: string[] = [
		'wait until the host has sent you the host key (through email, discord, etc.)',
		'submit the host key in the host key box',
		'copy the guest key',
		'send the guest key to the host',
		'wait until you connect!'
	];

	function getCurrentInstructions() {
		if ($connection.tag == 'hostCreatingKey' || $connection.tag == 'hostAwaitingGuestKey') {
			return hostInstructions;
		} else {
			return guestInstructions;
		}
	}

	let instructionsIndex = 0;

	let instructionsIndexChange: -1 | 1 = 1;
	let oldInstructionsIndex = instructionsIndex;
	$: {
		if (oldInstructionsIndex < instructionsIndex) {
			instructionsIndexChange = 1;
		} else if (oldInstructionsIndex > instructionsIndex) {
			instructionsIndexChange = -1;
		}
		oldInstructionsIndex = instructionsIndex;
	}
	$: {
		// move to next instruction after clicking submit
		if (
			$connection.tag == 'guestAwaitingChannel' &&
			(instructionsIndex == 0 || instructionsIndex == 1)
		) {
			instructionsIndex = 2;
		}
	}
	$: reverseInstructionsTransition = instructionsIndexChange == 1;
</script>

<div class="top palette-plain">
	{#if $connection.tag == 'empty'}
		<div class="start">
			<div class="explain">
				<p>
					Flower allows sharing through <a href="https://en.wikipedia.org/wiki/WebRTC">WebRTC</a> so
					I don't have to pay for servers. You can either
					<span class="usePalette palette-accent">host</span>
					a room to share your current flow, or edit someone else's flow as a
					<span class="usePalette palette-accent-secondary">guest</span>.
				</p>
			</div>
			<div class="hostGuestButtons">
				<Button
					palette="accent"
					icon="add"
					text="host new room"
					on:click={() => {
						initHostConnection();
					}}
				/>
				<Button
					palette="accent-secondary"
					icon="dots"
					text="join room as guest"
					on:click={() => {
						initGuestConnection();
					}}
				/>
			</div>
		</div>
	{:else if $connection.tag == 'hostConnected' || $connection.tag == 'guestConnected'}
		<p>Connected!</p>
	{:else}
		<div class="instructions">
			<Button
				icon="arrowLeft"
				disabled={instructionsIndex == 0}
				on:click={() => {
					instructionsIndex -= 1;
				}}
			/>
			<div class="instructionsText">
				{#key instructionsIndex}
					<h2
						in:instructionIn={{ reverse: reverseInstructionsTransition }}
						out:instructionOut={{ reverse: reverseInstructionsTransition }}
					>
						Step {instructionsIndex + 1}:
						{getCurrentInstructions()[instructionsIndex]}
					</h2>
				{/key}
			</div>
			<Button
				icon="arrowRight"
				disabled={instructionsIndex == getCurrentInstructions().length - 1}
				on:click={() => {
					instructionsIndex += 1;
				}}
			/>
		</div>
		<div class="panels">
			<div class="panel palette-accent fade">
				<div class="above">
					<h2>Host key</h2>
					{#if $connection.tag == 'hostCreatingKey' || $connection.tag == 'hostAwaitingGuestKey'}
						<Button
							icon="copy"
							text="copy"
							disabled={$connection.tag != 'hostAwaitingGuestKey'}
							tooltip="send this key to guest"
							on:click={() => {
								if ($connection.tag != 'hostAwaitingGuestKey') return;
								copyText($connection.localOffer);
								if (instructionsIndex == 0) {
									instructionsIndex += 1;
								}
							}}
						/>
					{:else if $connection.tag == 'guestCreatingKey' || $connection.tag == 'guestAwaitingHostKey' || $connection.tag == 'guestAwaitingChannel'}
						<Button
							icon="link"
							text="submit"
							on:click={() => {
								giveGuestHostKey(hostKey);
							}}
							disabled={$connection.tag != 'guestAwaitingHostKey'}
						/>
					{/if}
				</div>
				{#if $connection.tag == 'hostCreatingKey' || $connection.tag == 'hostAwaitingGuestKey'}
					<ShareKey
						message={$connection.tag == 'hostCreatingKey' ? 'creating host key' : null}
						content={$connection.tag == 'hostAwaitingGuestKey' ? $connection.localOffer : ''}
						editable={false}
					/>
				{:else if $connection.tag == 'guestCreatingKey' || $connection.tag == 'guestAwaitingHostKey' || $connection.tag == 'guestAwaitingChannel'}
					<ShareKey
						bind:content={hostKey}
						editable={$connection.tag == 'guestAwaitingHostKey'}
						on:keypress={(event) => {
							if (event.key == 'Enter') {
								giveGuestHostKey(hostKey);
							}
						}}
						placeholder={'paste host key here'}
					/>
				{/if}
			</div>
			<div class="panel palette-accent-secondary">
				<div class="above">
					<h2>Guest key</h2>
					{#if $connection.tag == 'hostCreatingKey' || $connection.tag == 'hostAwaitingGuestKey'}
						<Button
							icon="link"
							text="submit"
							on:click={() => {
								giveHostGuestKey(guestKey);
							}}
						/>
					{:else if $connection.tag == 'guestCreatingKey' || $connection.tag == 'guestAwaitingHostKey' || $connection.tag == 'guestAwaitingChannel'}
						<Button
							icon="copy"
							text="copy"
							disabled={$connection.tag != 'guestAwaitingChannel'}
							tooltip="send this key to guest"
							on:click={() => {
								if ($connection.tag != 'guestAwaitingChannel') return;
								copyText($connection.localOffer);
								if (instructionsIndex == 2) {
									instructionsIndex += 1;
								}
							}}
						/>
					{/if}
				</div>
				{#if $connection.tag == 'hostCreatingKey' || $connection.tag == 'hostAwaitingGuestKey'}
					<ShareKey
						bind:content={guestKey}
						editable={$connection.tag == 'hostAwaitingGuestKey'}
						on:keypress={(event) => {
							if (event.key == 'Enter') {
								giveHostGuestKey(guestKey);
							}
						}}
						placeholder={'paste guest key here'}
					/>
				{:else if $connection.tag == 'guestCreatingKey' || $connection.tag == 'guestAwaitingHostKey' || $connection.tag == 'guestAwaitingChannel'}
					<ShareKey
						message={$connection.tag == 'guestAwaitingHostKey'
							? 'need host key to make guest key'
							: $connection.tag == 'guestCreatingKey'
							? 'guest creating key'
							: null}
						content={$connection.tag == 'guestAwaitingChannel' ? $connection.localOffer : ''}
						editable={false}
					/>
				{/if}
			</div>
		</div>
	{/if}
	{#if $connection.tag != 'empty'}
		<div class="controls">
			<Button
				text={$connection.tag == 'hostConnected' || $connection.tag == 'guestConnected'
					? 'disconnect'
					: 'cancel'}
				icon="delete"
				on:click={() => {
					instructionsIndex = 0;
					hostKey = '';
					guestKey = '';
					disconnect();
				}}
			/>
		</div>
	{/if}
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 600px);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		padding: calc(var(--button-size) + var(--padding) * 2) 0 0 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);
	}

	.hostGuestButtons {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		width: 100%;
		justify-content: center;
	}
	.start {
		display: flex;
		flex-direction: column;
		padding: 0 var(--padding-big) var(--padding) var(--padding-big);
	}

	.instructions {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 3rem;
		padding: 0 var(--padding);
		box-sizing: border-box;
		gap: var(--padding);
	}
	.instructions h2 {
		display: block;
		text-align: center;
		width: 100%;
		font-size: 0.9rem;
	}

	.instructionsText {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		position: relative;
	}

	.panels {
		display: flex;
		flex-direction: row;
		width: 100%;
		padding: 0 var(--padding);

		box-sizing: border-box;
		gap: var(--padding);
	}

	.panel {
		width: 100%;
		height: 100%;
		display: flex;
		gap: var(--padding);
		flex-direction: column;
	}

	.controls {
		padding: 0 var(--padding) var(--padding) var(--padding);
		box-sizing: border-box;
		width: 100%;
	}

	.above {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--padding);
	}

	span.usePalette {
		color: var(--this-text);
	}

	.above h2 {
		color: var(--this-text);
		font-size: 0.9rem;
	}

	p {
		line-height: 1.5em;
	}
</style>
