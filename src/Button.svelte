<script>
  import Icon from './Icon.svelte';
  export let name;
</script>

<button class="top" on:click>
  <Icon {name} size="20px" />
</button>

<style>
  .top {
    padding: 0;
    box-sizing: content-box;
    border: none;
    background: none;
    display: block;
    width: 35px;
    height: 35px;
    margin: 0;
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
