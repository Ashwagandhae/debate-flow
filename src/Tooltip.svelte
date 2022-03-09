<script>
  import { tooltipTransition } from './transition.js';

  export let content = '';
  export let disabled = false;
  export let layout = 'bottom';
  let isHovered = false;
  let x;
  let y;
  let element;
  let tooltip;

  function mouseOver(event) {
    isHovered = true;
    mouseMove(event);
  }
  function mouseMove(event) {
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
    color: var(--color);
    background-color: var(--background-back);
    border-radius: var(--border-radius);
    position: fixed;
    white-space: nowrap;
    z-index: 10000;
  }
  .disabled {
    color: var(--color-weak);
  }
</style>
