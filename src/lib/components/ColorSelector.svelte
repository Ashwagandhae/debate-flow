<script lang="ts">
	import type { Hexcode } from "$lib/models/settings";

  export let value: Hexcode = "#ffffff";
</script>

<label class="palette-plain">
  <input type="color" bind:value />
  <div class="background" style={`--current-selector-color:${value}`}></div>
</label>

<style>
  label {
    margin-left: auto;
  }

  .background {
    position: relative;
    box-sizing: content-box;
    padding: var(--padding-small);
    width: calc(var(--button-size) * 2);
    height: calc(var(--button-size) - 2 * var(--line-width));
    background-color: var(--current-selector-color);
    border-radius: var(--border-radius);
    border: var(--line-width) solid var(--color);
    transition: filter var(--transition-speed);
  }

  .background:hover {
    filter: brightness(1.2);
  }

  input {
    visibility: hidden;
    position: absolute;
  }
</style>
