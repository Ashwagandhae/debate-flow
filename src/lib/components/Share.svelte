<script lang="ts">
	import Button from './Button.svelte';
	// import { restartSyncInterval, minimizeApp } from '$lib/models/sheetSharing';
	import { isSheetSharing } from '$lib/models/store';
	import {
		initHostConnection,
		initGuestConnection,
		giveGuestHostKey,
		giveHostGuestKey,
		connection,
		disconnect
	} from '$lib/models/sharingConnection';
	import ShareKey from './ShareKey.svelte';
	import { localOffer } from '$lib/models/sharingConnectionOld';

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}

	function sendMessage(message: string) {
		if ($connection.tag != 'guestConnected' && $connection.tag != 'hostConnected') return;
	}

	let message: string = '';

	let hostKey: string = '';
	let guestKey: string = '';
</script>

<div class="top palette-plain">
	{#if $connection.tag == 'empty'}
		<div class="start">
			<div class="explain">
				<h2>Sharing explained</h2>
				<p>
					Flower allows sharing through <a href="https://en.wikipedia.org/wiki/WebRTC">WebRTC</a> so
					I don't have to pay for servers.
				</p>
				<p>
					To collaborate, a host creates a room and sends a key (some copy-and-pasted text) to a
					guest, through email, discord, or anything else. The guest then sends another key back to
					the host. Once both keys are exchanged, the host and guest connect.
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
		<div class="panels">
			<div class="panel palette-accent">
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
					<ShareKey bind:content={hostKey} editable={$connection.tag == 'guestAwaitingHostKey'} />
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
							}}
						/>
					{/if}
				</div>
				{#if $connection.tag == 'hostCreatingKey' || $connection.tag == 'hostAwaitingGuestKey'}
					<ShareKey bind:content={guestKey} editable={$connection.tag == 'hostAwaitingGuestKey'} />
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
				on:click={() => disconnect()}
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
		flex-direction: column;
		gap: var(--padding);
	}
	.start {
		display: flex;
		flex-direction: row;
		padding: 0 var(--padding-big) var(--padding) var(--padding-big);
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

	h2 {
		color: var(--this-text);
	}
	p {
		line-height: 1.5em;
	}
</style>
