<script lang="ts">
	export let keys: string[];
	let keyDict: {
		[key: string]: string;
	} = {
		commandControl: '⌘/⌃',
		command: '⌘',
		shift: '⇧',
		option: '⌥',
		control: '⌃',
		up: '↑',
		down: '↓',
		left: '←',
		right: '→',
		escape: '⎋',
		return: '↵',
		space: '␣',
		delete: '⌫',
		backspace: '⌦',
		tab: '⇥',
		home: '⇱',
		end: '⇲',
		pageup: '⇞',
		pagedown: '⇟',
		insert: '⌤'
	};
</script>

<span class="top">
	{#each keys as key, index}
		{#if key in keyDict}
			<kbd class="modifier">{keyDict[key]}</kbd>
		{:else}
			<kbd class="key">{key.toUpperCase()}</kbd>
		{/if}
	{/each}
</span>

<style>
	.top {
		display: flex;
		flex-direction: row;
		gap: 0.3em;
		font-size: inherit;
		align-items: center;
	}
	kbd {
		font-weight: inherit;
		font-family: inherit;
		background: var(--background-indent);
		padding: var(--padding-small);
		border-radius: var(--border-radius-small);
		height: var(--font-size);
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.key {
		font-size: 0.8em;
	}
	.modifier {
		font-size: 1em;
	}
</style>
