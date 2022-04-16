<script lang="ts">
  import Button from './Button.svelte';
  import { popupTransition } from './transition';
  export let component: any;
  export let closeSelf: () => void;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeSelf();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="top" transition:popupTransition>
  <div class="close">
    <Button icon="delete" tooltip="close" on:click={closeSelf} />
  </div>
  <svelte:component this={component} closePopup={closeSelf} />
</div>

<style>
  .top {
    background: var(--background);
    display: block;
    position: absolute;
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .close {
    position: absolute;
  }
</style>
