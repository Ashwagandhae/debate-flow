<script>
  export let content;
</script>

<button class="top" on:click>
  {content}
</button>

<style>
  .top {
    padding: var(--padding);
    border: none;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: var(--border-radius);
    color: var(--color);
  }
  .top:hover {
    background-color: var(--background-indent);
  }
  .top:active {
    background-color: var(--background-active);
  }
</style>
