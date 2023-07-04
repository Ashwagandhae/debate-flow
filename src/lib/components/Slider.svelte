<script lang="ts">
	export let value: number;
	export let auto: number;
	export let detail: {
		min: number;
		max: number;
		step: number;
		hue?: boolean;
	};

	let mousedown: boolean = false;
	let drag: boolean = false;
	let startX = 0;
	function handleMouseDown(e: MouseEvent) {
		mousedown = true;
		startX = e.pageX;
		drag = false;
	}
	function handleMouseMove(e: MouseEvent) {
		// only consider it dragging if the mouse is down and has moved enough
		if (mousedown && Math.abs(startX - e.pageX) > 3) {
			drag = true;
		}
	}
	function handleMouseUp(_: MouseEvent) {
		mousedown = false;
		drag = false;
	}

	$: palette = auto == value ? 'accent-secondary' : 'accent';
</script>

<div
	class={`top palette-${palette}`}
	on:mousedown={handleMouseDown}
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
	class:hue={detail.hue}
	style={`--value: ${value}`}
	aria-valuemin={detail.min}
	aria-valuemax={detail.max}
	aria-valuenow={value}
	role="slider"
	tabindex="0"
>
	<label>
		<div
			class="switch"
			style={`
      left: calc(var(--padding-small) + ${
				(Math.max(Math.min(value, detail.max), detail.min) - detail.min) / (detail.max - detail.min)
			} * (100% - var(--button-size) - var(--padding-small) * 2));
      transition: left ${drag ? '0' : 'var(--transition-speed)'}
      , background var(--transition-speed);`}
		/>
		<input
			class="slider"
			type="range"
			min={detail.min}
			max={detail.max}
			step={detail.step}
			bind:value
		/>
	</label>
	<label class="small">
		<input type="number" bind:value />
	</label>
</div>

<style>
	.top {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
	}
	label {
		width: 100%;
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
	label.small {
		width: min-content;
	}
	.hue label {
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
	.hue label.small {
		background-image: none;
		background-color: hsl(var(--value), var(--slider-saturation), var(--slider-lightness));
	}

	.top:hover label {
		background-color: var(--this-background-active);
	}
	.top.hue:hover label {
		background-image: linear-gradient(
			to right,
			hsl(360, var(--slider-saturation), var(--slider-lightness-hover)),
			hsl(60, var(--slider-saturation), var(--slider-lightness-hover)),
			hsl(120, var(--slider-saturation), var(--slider-lightness-hover)),
			hsl(180, var(--slider-saturation), var(--slider-lightness-hover)),
			hsl(240, var(--slider-saturation), var(--slider-lightness-hover)),
			hsl(300, var(--slider-saturation), var(--slider-lightness-hover)),
			hsl(360, var(--slider-saturation), var(--slider-lightness-hover))
		);
	}
	.top.hue:hover label.small {
		background-image: none;
		background-color: hsl(var(--value), var(--slider-saturation), var(--slider-lightness-hover));
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		margin: 0;
		background: none;
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		opacity: 0;
		height: var(--button-size);
		width: var(--button-size);
	}
	input[type='range']::-moz-range-thumb {
		height: var(--button-size);
		opacity: 0;
		width: var(--button-size);
	}
	input[type='range']::-webkit-slider-runnable-track {
		width: 100%;
		background: none;
		box-sizing: border-box;
		height: 100%;
		position: absolute;
		padding: 0 var(--padding-small);
		top: var(--padding-small);
	}
	input[type='range']::-moz-range-track {
		width: 100%;
		background: none;
		box-sizing: border-box;
		height: 100%;
		position: absolute;
		padding: 0 var(--padding-small);
		top: var(--padding-small);
	}

	input[type='number'] {
		background: none;
		text-align: left;
		border: none;
		width: 3ch;
		outline: none;
		color: var(--this-text);
		margin-left: var(--padding-small);
	}

	input[type='number']::-webkit-outer-spin-button,
	input[type='number']::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.hue input[type='number'] {
		color: var(--text);
	}

	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}
	.slider {
		width: 100%;
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
