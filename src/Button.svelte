<script lang="ts">
  import Icon from './Icon.svelte';
  import Tooltip from './Tooltip.svelte';

  export let icon: string;
  export let text: string = null;
  export let tooltip: string = null;
  export let disabled: boolean | string = false;
  export let palette: string = 'plain';
  export let shortcut: string[] = null;
  export let disabledReason: string = 'disabled';
  export let tooltipLayout: string = 'bottom';
  function preventBlur(e) {
    e.preventDefault();
  }
</script>

<Tooltip
  content={tooltip}
  disabled={disabled && disabledReason}
  {shortcut}
  layout={tooltipLayout}
>
  <button
    class={`top palette-${disabled ? 'disabled' : palette}`}
    class:disabled
    on:click
    on:mousedown={preventBlur}
    disabled={!!disabled}
  >
    <Icon name={icon} size="var(--button-size)" />
    {#if text}
      <p>{text}</p>
    {/if}
  </button>
</Tooltip>

<style>
  .top {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--padding-small);

    box-sizing: content-box;
    padding: var(--padding);
    width: max-content;
    min-width: var(--button-size);
    height: var(--button-size);

    border: none;
    background: none;
    margin: 0;
    text-align: left;
    border-radius: var(--border-radius);
    font-weight: var(--font-weight);
    color: var(--this-text);
    transition: background var(--transition-speed);
  }
  p {
    display: block;
  }
  .top:hover {
    background-color: var(--this-background-indent);
  }
  .top.disabled:hover,
  .top.disabled:active {
    background: none;
  }
  .top:active {
    transition: none;
    background-color: var(--this-background-active);
  }
</style>
