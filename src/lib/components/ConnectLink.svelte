<script lang="ts">
	import {
		createConfirmLink,
		createJoinLink,
		giveHostGuestKey,
		type Broadcast,
		type Guest,
		type Host,
		type HostBroadcast
	} from '$lib/models/sharingConnection';
	import { onDestroy } from 'svelte';
	import Button from './Button.svelte';
	import CopyBox from './CopyBox.svelte';

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}

	export let connection: Host | Guest;
</script>

<div class="top">
	{#if connection.tag == 'hostCreatingKey'}
		<p>creating join link</p>
	{:else if connection.tag == 'hostAwaitingGuestKey'}
		<div class="above">
			<p>
				copy this <span class="usePalette palette-accent">join link</span> and send it to partners, through
				discord, email, etc..
			</p>
			<Button
				icon="copy"
				text="copy"
				palette="accent"
				on:click={() => {
					if (connection.tag == 'hostAwaitingGuestKey') {
						copyText(createJoinLink(connection.key));
					}
				}}
			/>
		</div>
		<div class="palette-accent">
			<CopyBox content={createJoinLink(connection.key)} />
		</div>
		<p>
			then, click on <span class="usePalette palette-accent-secondary">confirm links</span> sent to you
			by your partners to connect.
		</p>
	{:else if connection.tag == 'guestAwaitingHostKey'}
		<p>reading URL for host key</p>
	{:else if connection.tag == 'guestCreatingKey'}
		<p>creating confirm link</p>
	{:else if connection.tag == 'guestAwaitingChannel'}
		<div class="above">
			<p>
				copy this <span class="usePalette palette-accent-secondary">confirm link</span> and send it to
				the host, through discord, email, etc..
			</p>
			<Button
				icon="copy"
				text="copy"
				palette="accent-secondary"
				on:click={() => {
					if (connection.tag == 'guestAwaitingChannel') {
						copyText(createConfirmLink(connection.key));
					}
				}}
			/>
		</div>
		<div class="palette-accent-secondary">
			<CopyBox content={createConfirmLink(connection.key)} />
		</div>
		<p>
			then, wait for the <span class="usePalette palette-accent">host</span> to click on the
			<span class="usePalette palette-accent-secondary">confirm link</span> and connect.
		</p>
	{/if}
</div>

<style>
	.top {
		display: flex;
		align-items: left;
		flex-direction: column;
		padding: 0 var(--padding);
	}
	.above {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 3rem;
		box-sizing: border-box;
	}
	p {
		padding-left: var(--padding);
	}

	span.usePalette {
		color: var(--this-text);
	}
</style>
