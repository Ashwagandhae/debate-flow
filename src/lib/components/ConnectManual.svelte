<script lang="ts">
	import CopyBox from './CopyBox.svelte';
	import { instructionIn, instructionOut } from '$lib/models/transition';
	import {
		giveGuestHostKey,
		giveHostGuestKey,
		type Guest,
		type Host
	} from '$lib/models/sharingConnection';
	import Button from './Button.svelte';

	export let connection: Host | Guest;
	function getCurrentInstructions() {
		if (connection.tag == 'hostCreatingKey' || connection.tag == 'hostAwaitingGuestKey') {
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
	$: connection, onConnectionChange();

	function onConnectionChange() {
		if (
			connection.tag == 'guestAwaitingChannel' &&
			(instructionsIndex == 0 || instructionsIndex == 1)
		) {
			instructionsIndex = 2;
		}
	}

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
	$: reverseInstructionsTransition = instructionsIndexChange == 1;
</script>

<div class="top">
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
				{#if connection.tag == 'hostCreatingKey' || connection.tag == 'hostAwaitingGuestKey'}
					<Button
						icon="copy"
						text="copy"
						disabled={connection.tag != 'hostAwaitingGuestKey'}
						tooltip="send this key to guest"
						on:click={() => {
							if (connection.tag != 'hostAwaitingGuestKey') return;
							copyText(JSON.stringify(connection.key));
							if (instructionsIndex == 0) {
								instructionsIndex += 1;
							}
						}}
					/>
				{:else if connection.tag == 'guestCreatingKey' || connection.tag == 'guestAwaitingHostKey' || connection.tag == 'guestAwaitingChannel'}
					<Button
						icon="link"
						text="submit"
						on:click={() => {
							giveGuestHostKey(JSON.parse(hostKey));
						}}
						disabled={connection.tag != 'guestAwaitingHostKey'}
					/>
				{/if}
			</div>
			{#if connection.tag == 'hostCreatingKey' || connection.tag == 'hostAwaitingGuestKey'}
				<CopyBox
					message={connection.tag == 'hostCreatingKey' ? 'creating host key' : null}
					content={connection.tag == 'hostAwaitingGuestKey' ? JSON.stringify(connection.key) : ''}
					editable={false}
				/>
			{:else if connection.tag == 'guestCreatingKey' || connection.tag == 'guestAwaitingHostKey' || connection.tag == 'guestAwaitingChannel'}
				<CopyBox
					bind:content={hostKey}
					editable={connection.tag == 'guestAwaitingHostKey'}
					on:keypress={(event) => {
						if (event.key == 'Enter') {
							giveGuestHostKey(JSON.parse(hostKey));
						}
					}}
					placeholder={'paste host key here'}
				/>
			{/if}
		</div>
		<div class="panel palette-accent-secondary">
			<div class="above">
				<h2>Guest key</h2>
				{#if connection.tag == 'hostCreatingKey' || connection.tag == 'hostAwaitingGuestKey'}
					<Button
						icon="link"
						text="submit"
						on:click={() => {
							giveHostGuestKey(JSON.parse(guestKey));
						}}
					/>
				{:else if connection.tag == 'guestCreatingKey' || connection.tag == 'guestAwaitingHostKey' || connection.tag == 'guestAwaitingChannel'}
					<Button
						icon="copy"
						text="copy"
						disabled={connection.tag != 'guestAwaitingChannel'}
						tooltip="send this key to guest"
						on:click={() => {
							if (connection.tag != 'guestAwaitingChannel') return;
							copyText(JSON.stringify(connection.key));
							if (instructionsIndex == 2) {
								instructionsIndex += 1;
							}
						}}
					/>
				{/if}
			</div>
			{#if connection.tag == 'hostCreatingKey' || connection.tag == 'hostAwaitingGuestKey'}
				<CopyBox
					bind:content={guestKey}
					editable={connection.tag == 'hostAwaitingGuestKey'}
					on:keypress={(event) => {
						if (event.key == 'Enter') {
							giveHostGuestKey(JSON.parse(guestKey));
						}
					}}
					placeholder={'paste guest key here'}
				/>
			{:else if connection.tag == 'guestCreatingKey' || connection.tag == 'guestAwaitingHostKey' || connection.tag == 'guestAwaitingChannel'}
				<CopyBox
					message={connection.tag == 'guestAwaitingHostKey'
						? 'need host key to make guest key'
						: connection.tag == 'guestCreatingKey'
						? 'guest creating key'
						: null}
					content={connection.tag == 'guestAwaitingChannel' ? JSON.stringify(connection.key) : ''}
					editable={false}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.top {
		display: flex;
		flex-direction: column;
		width: 100%;
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

	.above {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--padding);
	}
	.above h2 {
		color: var(--this-text);
		font-size: 0.9rem;
	}
</style>
