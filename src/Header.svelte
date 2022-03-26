<script>
  import Tooltip from './Tooltip.svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let column;
</script>

<div class="top">
  {column}
</div>

<style>
  .top {
    width: var(--column-width);
    height: 100%;
    padding: var(--padding);
    text-align: center;
    box-sizing: border-box;
    user-select: none;
  }
</style>
