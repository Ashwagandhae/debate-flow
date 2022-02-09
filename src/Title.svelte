<script>
  import Text from './Text.svelte';
  import Button from './Button.svelte';
  import { afterUpdate } from 'svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let flow;

  let textarea;
  afterUpdate(function () {
    if (flow.focus) {
      textarea.focus();
    }
  });
  function handleBlur() {
    if (flow.focus) {
      delete flow.focus;
      flow = flow;
    }
  }

  function handleKeydown(e) {
    if (e.key == 'Enter' || e.key == 'ArrowDown') {
      e.preventDefault();
      dispatch('focusFlow');
    }
  }
</script>

<div class="top">
  <div class="content">
    <Text
      on:blur={handleBlur}
      on:keydown={handleKeydown}
      bind:value={flow.content}
      bind:this={textarea}
      nowrap
      placeholder="type name here"
    />
  </div>
  <div class="buttons-wrapper">
    <div class="buttons">
      <Button name="arrowRight" />
      <Button name="arrowUp" />
      <Button name="arrowDown" />
    </div>
  </div>
</div>

<style>
  .top {
    padding: var(--padding);
    font-size: 2em;
    display: flex;
    flex-direction: row;
  }
  .content {
    width: 50%;
  }
  .buttons-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
</style>
