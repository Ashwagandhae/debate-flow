<script lang="ts">
  import Box from './Box.svelte';
  import Header from './Header.svelte';
  import { Flow } from './types';

  import { setContext } from 'svelte';

  export let root: Flow;
  setContext('invert', {
    getinvert: () => {
      return root.invert;
    },
  });
  setContext('columnCount', {
    getColumnCount: () => {
      return root.columns.length;
    },
  });

  function saveFocus(e: { detail: number[] }) {
    root.lastFocus = e.detail;
    root = root;
  }
</script>

<div
  class="top"
  class:invert={root.invert}
  style={`--column-count: ${root.columns.length};`}
>
  <div class="viewer">
    <div class="content">
      <Box
        bind:content={root.content}
        bind:children={root.children}
        bind:index={root.index}
        bind:level={root.level}
        bind:focus={root.focus}
        root
        on:saveFocus={saveFocus}
      />
    </div>
    <div class="headers">
      {#each root.columns as column, index}
        <h1
          class={`header palette-${
            !!(index % 2) == root.invert ? 'accent' : 'accent-secondary'
          }`}
        >
          <Header {column} on:focusFlow />
        </h1>
      {/each}
    </div>
    <div class="columns">
      {#each root.columns as col, index}
        <div
          class={`column palette-${
            !!(index % 2) == root.invert ? 'plain' : 'plain-secondary'
          }`}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  .top {
    width: calc(var(--column-width) * var(--column-count));
    overflow: hidden;
  }
  .top {
    --this-background: var(--background-secondary);
    --this-background-secondary: var(--background);
    --this-accent-text: var(--accent-secondary-text);
    --this-accent-secondary-text: var(--accent-text);
  }
  .top.invert {
    --this-background: var(--background);
    --this-background-secondary: var(--background-secondary);
    --this-accent-text: var(--accent-text);
    --this-accent-secondary-text: var(--accent-secondary-text);
  }
  .viewer {
    position: relative;
    width: max-content;
    margin: auto;
    height: var(--view-height);
    overflow: hidden;
    display: flex;
    flex-direction: row;
  }
  .headers {
    position: relative;
    display: flex;
    flex-direction: row;
    width: auto;
    z-index: 2;
    height: 2.4em;
    transform: translateX(-100%);
    background: var(--background);
  }
  .header {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    background: var(--this-background);
    color: var(--this-text);
  }

  .columns {
    position: relative;
    display: flex;
    flex-direction: row;
    width: max-content;
    height: var(--view-height);
    transform: translateX(-200%);
    pointer-events: none;
    z-index: -2;
  }
  .column {
    height: 100%;
    width: var(--column-width);
    border-radius: var(--border-radius);
    background-color: var(--this-background);
  }
  .column:nth-child(even),
  .header:nth-child(even) {
    /* background-color: var(--this-background);
    color: var(--this-accent-text); */
  }
  .column:nth-child(odd),
  .header:nth-child(odd) {
    /* background: var(--this-background-secondary);
    color: var(--this-accent-secondary-text); */
  }
  .content {
    padding-bottom: calc(var(--view-height) * 0.6);
    padding-top: calc(2.4em + var(--padding));
    width: calc(var(--column-width) * var(--column-count));
    height: var(--view-height);
    overflow: auto;
    box-sizing: border-box;
  }
</style>
