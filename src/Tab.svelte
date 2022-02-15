<script>
  import { boxIn } from './transition.js';
  import { tabIn } from './transition.js';

  export let content;
  export let selected;
</script>

<button
  class="top"
  class:selected
  class:empty={content.length == 0}
  on:click
  in:tabIn
>
  {#if content}
    {content}
  {:else}
    no name
  {/if}
</button>

<style>
  .top {
    border: none;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: var(--border-radius);
    color: var(--color);
    padding: var(--padding);
    overflow-wrap: break-word;
  }
  .top.empty {
    color: var(--color-weak);
  }
  .top:hover,
  .top.selected {
    background-color: var(--background-indent);
  }
  .top:active {
    background-color: var(--background-active);
  }
</style>
