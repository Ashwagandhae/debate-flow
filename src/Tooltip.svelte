<script lang="ts">
  import { tooltipTransition } from './transition';
  import Shortcut from './Shortcut.svelte';
  import { tick } from 'svelte';

  export let content: string;
  export let shortcut: string[];
  export let disabled: boolean | string = false;
  export let layout: string = 'bottom';
  let isHovered: boolean = false;
  let x: number = 0;
  let y: number = 0;
  let element: HTMLElement;
  let tooltip: {
    offsetWidth: number;
    offsetHeight: number;
  };

  function mouseOver() {
    isHovered = true;
    mouseMove();
  }
  function mouseMove() {
    if (tooltip) {
      let rect = element.getBoundingClientRect();
      x = rect.left - tooltip.offsetWidth / 2 + rect.width / 2;
      if (x < 4) {
        x = 4;
      } else if (x + tooltip.offsetWidth > window.innerWidth - 4) {
        x = window.innerWidth - tooltip.offsetWidth - 4;
      }
      if (layout == 'bottom') {
        y = rect.bottom + 4;
      } else {
        y = rect.top - tooltip.offsetHeight - 4;
      }
    }
  }
  async function onContentChanged() {
    await tick();
    mouseMove();
  }
  $: content, shortcut, disabled, layout, onContentChanged();
  function mouseLeave() {
    isHovered = false;
  }
</script>

{#if content}
  <div
    class="element"
    on:mouseover={mouseOver}
    on:focus={mouseOver}
    on:mouseleave={mouseLeave}
    on:blur={mouseLeave}
    on:mousemove={mouseMove}
    bind:this={element}
  >
    <slot />
  </div>

  {#if isHovered}
    <div
      bind:this={tooltip}
      style="top: {y}px; left: {x}px;"
      class="tooltip"
      transition:tooltipTransition
    >
      <div class="content">
        {content}
      </div>
      {#if !disabled && shortcut}
        <Shortcut keys={shortcut} />
      {/if}
      {#if disabled}
        <div class="disabled">
          {disabled}
        </div>
      {/if}
    </div>
  {/if}
{:else}
  <slot />
{/if}

<style>
  .element {
    width: min-content;
    height: min-content;
  }
  .tooltip {
    border: none;
    padding: var(--padding);
    color: var(--text);
    background-color: var(--background-back);
    border-radius: var(--border-radius);
    position: fixed;
    white-space: nowrap;
    z-index: 10000;
    box-shadow: var(--box-shadow);
  }
  .disabled {
    color: var(--text-weak);
  }
</style>
