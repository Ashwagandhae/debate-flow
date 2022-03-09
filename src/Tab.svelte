<script>
  import { tabIn } from './transition.js';

  export let flow;
  export let selected;
</script>

<div class="top" in:tabIn class:invert={flow.invert}>
  <button class:selected class:empty={flow.content.length == 0} on:click>
    {#if flow.content}
      {flow.content}
    {:else}
      no name
    {/if}
  </button>
</div>

<style>
  .top {
    margin-bottom: var(--padding);
    border-radius: var(--border-radius-small);
  }
  .top {
    --this-background-accent: var(--background-accent);
    --this-accent-text: var(--accent-text);
  }
  .top.invert {
    --this-background-accent: var(--background-accent-secondary);
    --this-accent-text: var(--accent-secondary-text);
  }
  button {
    border: none;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: var(--border-radius);
    color: var(--this-accent-text);
    padding: var(--padding);
    overflow-wrap: break-word;
    transition: background var(--transition-speed);
    font-weight: var(--font-weight);
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
    background-color: var(--this-background-accent);
  }
</style>
