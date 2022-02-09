<script>
  import Text from './Text.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let column;

  function handleKeydown(e) {
    if (e.key == 'Enter' || e.key == 'ArrowDown') {
      e.preventDefault();
      dispatch('focusFlow');
    }
  }
</script>

<div class="top">
  <Text bind:value={column} on:keydown={handleKeydown} nowrap />
</div>

<style>
  .top {
    width: var(--column-width);
    height: 100%;
    padding: 0 var(--padding);
    box-sizing: border-box;
  }
</style>
