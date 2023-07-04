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
		gap: var(--padding);
		font-size: inherit;
		align-items: center;
	}
	kbd {
		font-weight: inherit;
		font-family: inherit;
		background: var(--background-indent);
		padding: var(--padding) var(--padding-big);
		border-radius: var(--border-radius);
		height: auto;
		box-sizing: border-box;
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.key {
		font-size: calc(var(--font-size) * 2);
		background: var(--background-accent-secondary-active);
	}
	.modifier {
		font-size: calc(var(--font-size) * 2);
		background: var(--background-accent-active);
	}
</style>
