<script lang="ts">
	let size: string = 'var(--button-size)';
</script>

<svg style={`width:${size};height:${size};`} viewBox="0 0 100 100" fill="none" stroke="var(--text)">
	<path
		d="M68 8L49 29L30 8"
		stroke="currentColor"
		stroke-width="10"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="arrowAbove"
	/>
	<path
		d="M30 92L49 71L68 92"
		stroke="currentColor"
		stroke-width="10"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="arrowBelow"
	/>
</svg>

<style>
	svg {
		display: block;
		margin: auto;
		stroke: currentColor;
	}
	.arrowAbove {
		transform-origin: 50% 17%;
	}
	.arrowBelow {
		transform-origin: 50% 83%;
	}
	.arrowAbove,
	.arrowBelow {
		transition: rotate var(--transition-speed);
	}
	:global(.foldParent:hover) .arrowAbove {
		rotate: -180deg;
	}

	:global(.foldParent:hover) .arrowBelow {
		rotate: 180deg;
	}
</style>
