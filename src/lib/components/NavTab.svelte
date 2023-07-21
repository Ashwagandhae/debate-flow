<script lang="ts">
	import { page } from '$app/stores';

	export let palette: string = 'plain';
	export let link: string;
	export let title: string;

	$: selected = $page.url.pathname === link;
</script>

<div class={`top palette-${palette}`}>
	<a href={link}>
		<button class:selected>
			{title}
		</button>
	</a>
</div>

<style>
	.top {
		padding-bottom: var(--padding);
		border-radius: var(--border-radius-small);
		flex: 1;
	}
	button {
		border: none;
		background: none;
		display: block;
		width: 100%;
		text-align: left;
		border-radius: var(--border-radius);
		color: var(--this-text);
		padding: var(--padding);
		overflow-wrap: break-word;
		transition: background var(--transition-speed), transform var(--transition-speed) ease;
		font-weight: var(--font-weight);
	}

	button:hover {
		background-color: var(--this-background-indent);
	}
	button:active {
		transition: none;
		background-color: var(--this-background-active);
	}
	button.selected {
		background-color: var(--this-background-active);
	}
	a {
		text-decoration: none;
		color: inherit;
		display: block;
	}
</style>
