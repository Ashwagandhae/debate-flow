<script>
  import Icon from './Icon.svelte';
  export let content;
</script>

<button class="top" on:click>
  <Icon name="add" size="1em" />
  <div class="content">
    {content}
  </div>
</button>

<style>
  .top {
    padding: var(--padding);
    border: none;
    background: none;
    border-radius: var(--border-radius);
    color: var(--color);
    white-space: nowrap;
    flex: 1 0 auto;
    margin: 0;
    transition: background var(--transition-speed);
    display: flex;
    flex-direction: row;
    gap: 0.3em;
    font-weight: var(--font-weight);
  }
  .top:hover {
    background-color: var(--background-indent);
  }
  .top:active {
    transition: none;
    background-color: var(--background-active);
  }
  .content {
    width: 100%;
    text-align: left;
  }
</style>
