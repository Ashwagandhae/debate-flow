<script>
  import Box from './Box.svelte';
  import Header from './Header.svelte';

  import { setContext } from 'svelte';

  export let root;
  setContext('neg', {
    getNeg: () => {
      return root.neg;
    },
  });
  setContext('columnCount', {
    getColumnCount: () => {
      return root.columns.length;
    },
  });

  function saveFocus(e) {
    root.lastFocus = e.detail;
    root = root;
  }
</script>

<div
  class="top"
  class:neg={root.neg}
  style={`--column-count: ${root.columns.length};`}
>
  <div class="viewer">
    <div class="content" class:neg={root.neg}>
      <Box bind:data={root} root on:saveFocus={saveFocus} />
    </div>
    <div class="headers">
      {#each root.columns as column}
        <div class="header">
          <Header bind:column on:focusFlow />
        </div>
      {/each}
    </div>
    <div class="columns">
      {#each root.columns as col}
        <div class="column" />
      {/each}
    </div>
  </div>
</div>

<style>
  .top {
    width: calc(var(--column-width) * var(--column-count));
    overflow: hidden;
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
    height: 2em;
    transform: translateX(-100%);
    background: var(--background);
  }
  .header {
    border-radius: var(--border-radius) var(--border-radius) 0 0;
  }

  .columns {
    position: relative;
    display: flex;
    flex-direction: row;
    width: max-content;
    height: var(--view-height);
    transform: translateX(-200%);
    pointer-events: none;
    z-index: -1;
  }
  .column {
    height: 100%;
    width: var(--column-width);
    border-radius: var(--border-radius);
  }
  .column:nth-child(even),
  .neg .column:nth-child(odd),
  .header:nth-child(even),
  .neg .header:nth-child(odd) {
    background-color: var(--background-secondary);
  }
  .neg .column:nth-child(even),
  .column:nth-child(odd),
  .neg .header:nth-child(even),
  .header:nth-child(odd) {
    background: var(--background);
  }
  .content {
    padding-bottom: calc(var(--view-height) * 0.6);
    padding-top: calc(2em + var(--padding));
    width: calc(var(--column-width) * var(--column-count));
    height: var(--view-height);
    overflow: auto;
    box-sizing: border-box;
  }
</style>
