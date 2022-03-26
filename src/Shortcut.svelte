<script>
  export let keys;
</script>

<span class="top">
  {#each keys as key, index}
    {#if index != 0}+{/if}
    <kbd class="key">{key}</kbd>
  {/each}
</span>

<style>
  .top {
    display: flex;
    flex-direction: row;
    gap: 0.3em;
    font-size: inherit;
    align-items: center;
  }
  kbd {
    font-size: 0.8em;
    font-weight: inherit;
    font-family: inherit;
    background: var(--background-indent);
    padding: var(--padding-small);
    border-radius: var(--border-radius-small);
  }
</style>
