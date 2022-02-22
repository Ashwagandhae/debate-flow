<script>
  import Icon from './Icon.svelte';
  export let name;
  export let disabled = false;
  function preventBlur(e) {
    e.preventDefault();
  }
</script>

<button class="top" class:disabled on:click on:mousedown={preventBlur}>
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
    transition: background var(--transition-speed);
  }
  .top.disabled {
    --color: var(--color-weak);
  }
  .top:hover {
    background-color: var(--background-indent);
  }
  .top.disabled:hover,
  .top.disabled:active {
    cursor: not-allowed;
    background: none;
  }
  .top:active {
    transition: none;
    background-color: var(--background-active);
  }
</style>
