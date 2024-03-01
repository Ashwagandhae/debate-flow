<script lang="ts">
	import Button from './Button.svelte';
	import {
		initHostConnection,
		initGuestConnection,
		connection,
		disconnect
	} from '$lib/models/sharingConnection';
	import ConnectManual from './ConnectManual.svelte';
	import ConnectLink from './ConnectLink.svelte';

	let connectionMode: 'manual' | 'link' = 'link';
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
					icon="gear"
					text={connectionMode == 'manual' ? 'using manual connect' : 'using link connect'}
					tooltip={connectionMode == 'manual'
						? 'switch to link connect'
						: 'switch to manual connect'}
					on:click={() => {
						connectionMode = connectionMode == 'manual' ? 'link' : 'manual';
					}}
				/>
				<div class="buttons">
					{#if connectionMode == 'manual'}
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
					{:else}
						<Button
							palette="accent"
							icon="add"
							text="host new room"
							on:click={() => {
								initHostConnection();
							}}
						/>
					{/if}
				</div>
			</div>
		</div>
	{:else if $connection.tag == 'hostConnected' || $connection.tag == 'guestConnected'}
		<p>Connected!</p>
	{:else if connectionMode == 'manual'}
		<ConnectManual />
	{:else}
		<ConnectLink />
	{/if}
	{#if $connection.tag != 'empty'}
		<div class="controls">
			<Button
				text={$connection.tag == 'hostConnected' || $connection.tag == 'guestConnected'
					? 'disconnect'
					: 'cancel'}
				icon="delete"
				on:click={() => {
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
		justify-content: space-between;
	}
	.start {
		display: flex;
		flex-direction: column;
		padding: 0 var(--padding) var(--padding) var(--padding);
	}

	span.usePalette {
		color: var(--this-text);
	}

	p {
		line-height: 1.5em;
	}
	.controls {
		padding: 0 var(--padding) var(--padding) var(--padding);
		box-sizing: border-box;
		width: 100%;
	}

	.buttons {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		justify-content: center;
	}
</style>
