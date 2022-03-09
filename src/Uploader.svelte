<script>
  import Button from './Button.svelte';
  import { flows } from './stores.js';

  function openUploadDialog() {
    document.getElementById('uploadId').click();
  }
</script>

<div class="top">
  <Button
    icon="upload"
    text="choose file from computer"
    tooltip="upload a JSON file from your computer"
    tooltipLayout="top"
    on:click={openUploadDialog}
  />
  <p>Or drag and drop a JSON file anywhere in this window</p>
</div>

<style>
  .top {
    padding: var(--padding-big);
    padding-top: calc(var(--button-size) + var(--padding));
    width: clamp(300px, 20vw, 400px);
    height: min-content;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--padding-big);
  }
  p {
    margin: 0;
  }
</style>
