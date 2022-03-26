<script>
  import Text from './Text.svelte';
  import { flows, selected } from './stores.js';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let content;
  export let children;
  export let index;
  export let level;
  export let focus;
  export let invert;
  $: path = [index];

  let textarea;
  function handleBlur() {
    if (focus) {
      focus = false;
    }
  }
  function handleFocus() {
    if (!focus) {
      focus = true;
    }
  }
  let lineColor;
  $: {
    if (focus) {
      lineColor = 'var(--accent)';
    } else {
      lineColor = 'none';
    }
  }

  function handleKeydown(e) {
    if (e.key == 'Enter' || e.key == 'ArrowDown') {
      e.preventDefault();
      if (children.length > 0) {
        children[0].focus = true;
        focus = false;
      }
    }
  }
  let hasSentEdit = false;
  function focusChange() {
    if (focus) {
      $flows[$selected].history.addFocus([...path]);
      dispatch('saveFocus', path);
      textarea && textarea.focus();
    } else {
      hasSentEdit = false;
    }
  }
  onMount(focusChange);
  $: focus, focusChange();
  function handleBeforeinput(e) {
    if (!hasSentEdit) {
      console.log('created pneding', path);
      $flows[$selected].history.addPending('edit', [...path], {
        lastContent: content,
        getNextContent: function () {
          return content;
        },
        createEditBreak: function () {
          hasSentEdit = false;
        },
      });
    }
    hasSentEdit = true;
  }
  let palette = 'plain';
  $: {
    if (invert) {
      palette = 'accent-secondary';
    } else {
      palette = 'accent';
    }
  }
</script>

<div class={`top palette-${palette}`} class:invert>
  <div class="content" class:focus>
    <Text
      on:blur={handleBlur}
      on:focus={handleFocus}
      on:keydown={handleKeydown}
      on:beforeinput={handleBeforeinput}
      bind:value={content}
      bind:this={textarea}
      nowrap
      placeholder="type name here"
    />
  </div>
</div>

<style>
  .top {
    font-size: calc(var(--title-height) * 0.5);
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: var(--title-height);
  }
  .content {
    width: 100%;
    padding: 0 var(--padding);
    border-radius: var(--border-radius);
    color: var(--this-text);
  }
  .content.focus {
    background-color: var(--this-background-indent);
  }
</style>
