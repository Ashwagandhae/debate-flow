<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import { settings } from './settings';

  export let value: string;
  export let placeholder: string = '';
  export let nowrap: boolean = false;
  let whiteSpaceCss: string;
  $: {
    if (nowrap) {
      whiteSpaceCss = 'nowrap';
    } else {
      whiteSpaceCss = 'auto';
    }
  }
  let textarea: HTMLTextAreaElement;

  function autoHeight() {
    if (textarea) {
      textarea.value = textarea.value.replace(/\r?\n|\r/g, '');
      textarea.style.height = '0px';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
  afterUpdate(function () {
    autoHeight();
  });
  onDestroy(
    settings.subscribe(['fontSize'], function () {
      autoHeight();
    })
  );
  export const focus = () => {
    textarea.focus();
  };
</script>

<textarea
  bind:value
  bind:this={textarea}
  on:load={autoHeight}
  on:input={autoHeight}
  on:input
  on:beforeinput
  on:keydown
  on:focus
  on:blur
  spellcheck="false"
  {placeholder}
  style={`--white-space:${whiteSpaceCss};`}
/>

<style>
  textarea {
    box-sizing: border-box;
    resize: none;
    outline: none;
    display: block;
    overflow-y: hidden;
    margin: 0;
    line-height: 1.5em;

    width: 100%;
    height: calc(1em + var(--padding) * 2 + 6px);

    background: none;
    padding: 0;
    border: none;
    border-radius: 0;
    font-size: inherit;
    color: inherit;
    white-space: var(--white-space);
  }
  textarea::-webkit-scrollbar {
    display: none;
  }
  textarea {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  textarea:focus {
    z-index: 10000;
  }
  textarea::placeholder {
    color: var(--this-text-weak);
  }
  textarea::selection {
    background: var(--this-text-select);
  }
</style>
