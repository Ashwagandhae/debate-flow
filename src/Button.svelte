<script>
  import Icon from './Icon.svelte';
  import Tooltip from './Tooltip.svelte';
  export let icon;
  export let text = null;
  export let tooltip = null;
  export let disabled = false;
  export let disabledReason = 'disabled';
  export let tooltipLayout = 'bottom';
  function preventBlur(e) {
    e.preventDefault();
  }
</script>

<Tooltip
  content={tooltip}
  disabled={disabled && disabledReason}
  layout={tooltipLayout}
>
  <button
    class="top"
    class:disabled
    on:click
    on:mousedown={preventBlur}
    {disabled}
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
    gap: 5px;

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
    color: var(--color);
    transition: background var(--transition-speed);
  }
  p {
    display: block;
  }
  .top.disabled {
    --color: var(--color-weak);
  }
  .top:hover {
    background-color: var(--background-indent);
  }
  .top.disabled:hover,
  .top.disabled:active {
    background: none;
  }
  .top:active {
    transition: none;
    background-color: var(--background-active);
  }
</style>
