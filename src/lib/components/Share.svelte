<script lang="ts">
	import Button from './Button.svelte';
	// import { restartSyncInterval, minimizeApp } from '$lib/models/sheetSharing';
	import { isSheetSharing } from '$lib/models/store';
	import {
		initHostConnection,
		initGuestConnection,
		giveGuestHostKey,
		giveHostGuestKey,
		connection
	} from '$lib/models/sharingConnection';

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

<div class="top palette-plain" class:isSheetSharing={$isSheetSharing}>
	<h1>Sharing successful!</h1>
	<p>
		Sharing is new and probably has bugs. <a href="https://github.com/Ashwagandhae/debate-flow"
			>Let me know!</a
		>
	</p>
	{#if $connection.tag == 'empty'}
		<Button
			icon="dots"
			text="init host"
			on:click={() => {
				initHostConnection();
			}}
		/>
		<Button
			icon="dots"
			text="init guest"
			on:click={() => {
				initGuestConnection();
			}}
		/>
	{:else if $connection.tag == 'hostCreatingKey'}
		<p>host creating key</p>
	{:else if $connection.tag == 'hostAwaitingGuestKey'}
		<div class="codeScroll">
			<code>{$connection.localOffer}</code>
		</div>
		<input type="text" bind:value={guestKey} />
		<Button
			icon="dots"
			text="submit guest key"
			on:click={() => {
				giveHostGuestKey(guestKey);
			}}
		/>
	{:else if $connection.tag == 'guestAwaitingHostKey'}
		<input type="text" bind:value={hostKey} />
		<Button
			icon="dots"
			text="submit host key"
			on:click={() => {
				giveGuestHostKey(hostKey);
			}}
		/>
	{:else if $connection.tag == 'guestCreatingKey'}
		<p>guest creating key</p>
	{:else if $connection.tag == 'guestAwaitingChannel'}
		<div class="codeScroll">
			<code>{$connection.localOffer}</code>
		</div>
	{:else if $connection.tag == 'guestConnected' || $connection.tag == 'hostConnected'}
		<input type="text" bind:value={message} />
		<Button
			icon="dots"
			text="send"
			on:click={() => {
				sendMessage(message);
			}}
		/>
	{/if}
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 800px);
		height: min(calc(100vh - var(--padding) * 2), 700px);
		padding: calc(var(--button-size) + var(--padding) * 2) 0 0 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);
	}
	.top.isSheetSharing {
		width: min(calc(100vw - var(--padding) * 2), min-content);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		padding: calc(var(--button-size) + var(--padding) * 2) var(--padding-big) var(--padding-big)
			var(--padding-big);
		align-items: flex-start;
	}
	.explainContentScroll {
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--padding-big);
		padding: 0 var(--padding-big);
	}

	.controls {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		justify-content: center;
	}
	div.codeScroll {
		padding: var(--padding);
		border-radius: var(--border-radius);
		height: 6rem;
		overflow: auto;
		background: var(--background-indent);
		position: relative;
	}
	.above {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.codeScroll code {
		font-size: 0.6rem;
		/* break all words */
		word-break: break-all;
	}

	code {
		font-size: inherit;
		white-space: pre-wrap;
		background: var(--background-indent);
		padding: var(--padding-small);
		font-family: var(--font-family);
		border-radius: var(--border-radius);
	}

	h1 {
		padding: var(--padding-big) 0 var(--padding) 0;
	}
	h2 {
		padding: var(--padding-big) 0 var(--padding) 0;
	}
	p {
		margin: var(--padding) 0;
		line-height: 2;
	}

	button {
		width: 100%;
		border: none;
		background: none;
		padding: var(--padding);
		border-radius: var(--border-radius);
		text-align: left;
		transition: background var(--transition-speed);
		color: var(--text);
		text-align: center;
	}
	button:hover {
		background-color: var(--background-indent);
	}
	button:active,
	button.selected {
		background-color: var(--background-active);
	}

	.browserSelector {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
	}
</style>
