<script>
  import Text from './Text.svelte';
  import Overlay from './Overlay.svelte';
  import { afterUpdate } from 'svelte';
  import { flows, selected } from './stores.js';

  import { createEventDispatcher } from 'svelte';

  export let content;
  export let children;
  export let index;
  export let level;
  export let focus;
  export let invert;
  $: path = [index];

  let textarea;
  afterUpdate(function () {
    if (focus) {
      textarea.focus();
    }
  });

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
      if (level >= 1) {
        $flows[$selected].history.addFocus([...path]);
        dispatch('saveFocus', path);
        textarea && textarea.focus();
      }
    } else {
      hasSentEdit = false;
    }
  }
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
</script>

<div class="top" class:invert>
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
  .top {
    --this-background-accent: var(--background-accent);
    --this-accent-text: var(--accent-text);
  }
  .top.invert {
    --this-background-accent: var(--background-accent-secondary);
    --this-accent-text: var(--accent-secondary-text);
  }
  .content {
    width: 100%;
    padding: 0 var(--padding);
    border-radius: var(--border-radius);
    color: var(--this-accent-text);
  }
  .content.focus {
    background-color: var(--this-background-accent);
  }
</style>
