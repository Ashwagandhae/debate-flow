<script lang="ts">
  import { Flow } from './types';

  export let flow: Flow;
  export let selected: boolean;

  let palette: string;
  $: {
    if (flow.invert) {
      palette = 'accent-secondary';
    } else {
      palette = 'accent';
    }
  }
</script>

<div class={`top palette-${palette}`} class:invert={flow.invert}>
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
    flex: 1;
  }
  button {
    border: none;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: var(--border-radius);
    color: var(--this-text);
    padding: var(--padding);
    overflow-wrap: break-word;
    transition: background var(--transition-speed),
      transform var(--transition-speed) ease;
    font-weight: var(--font-weight);
    margin-bottom: var(--padding);
  }
  button.empty {
    color: var(--this-text-weak);
  }
  button:hover {
    background-color: var(--this-background-indent);
  }
  button:active {
    transition: none;
    background-color: var(--this-background-active);
  }
  button.selected {
    background-color: var(--this-background-active);
  }
  :global(.overFirst) button {
    background-color: var(--this-background-indent);

    transform: translateY(calc(var(--padding) * -1));
  }
  :global(.overSecond) button {
    background-color: var(--this-background-indent);

    transform: translateY(calc(var(--padding) * 1));
  }
  :global(.dragSource) button {
    transform: none;
    background-color: var(--this-background-active);
  }
</style>
