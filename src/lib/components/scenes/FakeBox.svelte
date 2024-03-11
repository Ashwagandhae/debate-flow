<script lang="ts">
	import Text from '$lib/components/Text.svelte';
	export let text: string;
	export let below = false;
	export let childFocus = false;
</script>

<div class="content" class:childFocus class:left={false} class:right={false}>
	<div class="barcontainer">
		<div class="line above" class:left={false} class:right={false} role="separator" />

		<div class="text">
			<span>{text}</span>
		</div>
		<div class="line below" role="separator" class:hide={!below} />
	</div>
</div>

<style>
	.content {
		width: var(--column-width);
		height: min-content;
		flex-direction: row;
		display: flex;
		grid-area: a;
		transition: background var(--transition-speed);
		position: relative;
		border-radius: var(--border-radius-small);
		color: var(--this-text);
	}

	.text {
		padding: var(--padding);
		position: relative;
	}

	.content.left {
		border-radius: var(--border-radius-small) 0 var(--border-radius-small)
			var(--border-radius-small);
	}
	.content.right {
		border-radius: 0 var(--border-radius-small) var(--border-radius-small)
			var(--border-radius-small);
	}
	.content.left.right {
		border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
	}

	.line {
		z-index: 1;
	}
	.line {
		content: '';
		display: block;
		background-color: var(--this-background-indent);
		height: var(--line-width);
		margin-left: var(--padding);
		width: calc(var(--column-width) - var(--padding) * 2);
		border-radius: var(--border-radius-small);
		margin-top: calc(-0.5 * var(--line-width));
		position: absolute;
		transition: width var(--transition-speed), margin var(--transition-speed),
			background var(--transition-speed);
	}
	.line.below {
		margin-top: calc(-0.5 * var(--line-width));
	}

	.line.left {
		width: calc(var(--column-width) - var(--padding));
		border-radius: 3px 0 0 3px;
	}
	.line.right {
		width: calc(var(--column-width) - var(--padding));
		margin-left: 0;
		border-radius: 0 3px 3px 0;
	}
	.line.left.right {
		width: calc(var(--column-width));
		border-radius: 0;
		margin-left: 0;
	}
	.line.hide {
		background-color: transparent;
	}
	span {
		line-height: 1.5em;
		font-size: inherit;
		color: inherit;
	}

	.childFocus.content {
		background: var(--this-background-indent);
	}
	.childFocus .line {
		z-index: 2;
		background-color: var(--this-color-fade);
	}
</style>
