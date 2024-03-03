<script lang="ts">
	import type { Guest, Host } from '$lib/models/sharingConnection';
	import Button from './Button.svelte';

	export let connection: Host | Guest;

	export let close: (() => void) | null = null;

	function describeConnectionState(state: RTCPeerConnectionState): string {
		switch (state) {
			case 'new':
				return 'connecting';
			case 'connecting':
				return 'connecting';
			case 'connected':
				return 'connected';
			case 'disconnected':
				return 'reconnecting';
			case 'failed':
				return 'closed';
			case 'closed':
				return 'closed';
		}
	}

	function isConnectionWeak(state: RTCPeerConnectionState): boolean {
		if (state == 'connected') return false;
		return true;
	}
</script>

<div class="top" class:weak={isConnectionWeak(connection.pc.connectionState)}>
	<div class="text">
		{describeConnectionState(connection.pc.connectionState)}
		{#if connection.tag == 'hostConnected'}
			to
		{:else}
			as
		{/if}
		{#if (connection.tag == 'hostConnected' || connection.tag == 'guestConnected') && connection.name != null}
			{connection.name}
		{:else}
			unnamed
		{/if}
	</div>
	{#if close != null}
		<Button
			icon="delete"
			tooltip="kick"
			palette="plain-secondary"
			onclick={() => {
				if (close == null) return;
				close();
			}}
		/>
	{/if}
</div>

<style>
	.top {
		border-radius: var(--border-radius);
		display: flex;
		flex-direction: row;
		align-items: center;
		background: var(--background-indent);
	}
	.text {
		height: var(--button-size);
		padding: var(--padding) var(--padding) var(--padding) var(--padding);
		display: flex;
		flex-direction: row;
		align-items: center;
		white-space: nowrap;
	}
	.weak .text {
		color: var(--text-weak);
	}
</style>
