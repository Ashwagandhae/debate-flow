<script>
  import { tabIn, brIn } from './transition.js';
  import Overlay from './Overlay.svelte';

  export let content;
  export let selected;

  let lineColor;
  $: {
    if (selected) {
      lineColor = 'var(--accent)';
    } else {
      lineColor = 'none';
    }
  }
</script>

<div class="top" in:tabIn>
  <button class:selected class:empty={content.length == 0} on:click>
    {#if content}
      {content}
    {:else}
      no name
    {/if}
  </button>
  {#if selected}
    <div class="line" in:brIn|local>
      <Overlay background={lineColor} />
    </div>
  {/if}
</div>

<style>
  .top {
    margin-bottom: var(--padding);
    border-radius: var(--border-radius-small);
  }
  button {
    border: none;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: var(--border-radius-small);
    color: var(--color);
    padding: var(--padding);
    overflow-wrap: break-word;
    transition: background var(--transition-speed);
  }
  button.empty {
    color: var(--color-weak);
  }
  button:hover {
    background-color: var(--background-indent);
  }
  button:active {
    transition: none;
    background-color: var(--background-active);
  }
  button.selected {
    background-color: var(--background-accent);
  }
  .line {
    content: '';
    display: block;
    background-color: none;
    height: var(--br-height);
    margin-left: var(--padding);
    width: calc(100% - var(--padding) * 2);
    border-radius: var(--border-radius-small);
    margin-top: calc(-1 * var(--padding) + -0.5 * var(--br-height));
    position: relative;
  }
</style>
