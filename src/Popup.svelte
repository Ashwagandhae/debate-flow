<script>
  import Button from './Button.svelte';
  import { popupTransition } from './transition.js';
  export let component;
  export let closeSelf;
</script>

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
    position: relative;
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .close {
    position: absolute;
  }
</style>
