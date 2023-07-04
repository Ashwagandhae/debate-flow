<script lang="ts">
	$: palette = 'accent-secondary';
	let max = 1;
	let min = 0;
	export let value: number;
</script>

<div class={`top palette-${palette}`}>
	<div class="label">
		<div
			class="switch"
			style={`
      left: calc(var(--padding-small) + ${
				(Math.max(Math.min(value, max), min) - min) / (max - min)
			} * (100% - var(--button-size) - var(--padding-small) * 2));`}
		/>
	</div>
</div>

<style>
	.top {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
	}
	div.label {
		width: 150px;
		position: relative;
		box-sizing: content-box;
		display: block;
		padding: var(--padding-small) 0;
		height: var(--button-size);
		background-color: var(--this-background-indent);
		border-radius: var(--border-radius);
		transition: background var(--transition-speed), background-image var(--transition-speed);
		margin: calc(var(--padding-small)) 0;
	}

	.hue div.label {
		background-image: linear-gradient(
			to right,
			hsl(360, var(--slider-saturation), var(--slider-lightness)),
			hsl(60, var(--slider-saturation), var(--slider-lightness)),
			hsl(120, var(--slider-saturation), var(--slider-lightness)),
			hsl(180, var(--slider-saturation), var(--slider-lightness)),
			hsl(240, var(--slider-saturation), var(--slider-lightness)),
			hsl(300, var(--slider-saturation), var(--slider-lightness)),
			hsl(360, var(--slider-saturation), var(--slider-lightness))
		);
	}

	.switch {
		position: absolute;

		box-sizing: content-box;
		padding: calc(var(--padding-small) - var(--padding-small));
		width: var(--button-size);
		height: var(--button-size);
		left: var(--padding-small);
		top: var(--padding-small);

		border: none;
		background-color: var(--this-color);
		color: var(--this-text);
		border-radius: var(--border-radius);
	}
	.hue .switch {
		background-color: hsl(var(--value), var(--slider-saturation), var(--slider-switch-lightness));
	}
</style>
