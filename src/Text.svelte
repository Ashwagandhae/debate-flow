<script>
  import { afterUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let value;
  export let placeholder = '';
  export let nowrap = false;
  let whiteSpaceCss;
  $: {
    if (nowrap) {
      whiteSpaceCss = 'nowrap';
    } else {
      whiteSpaceCss = 'auto';
    }
  }
  let textarea;

  function autoHeight() {
    textarea.value = textarea.value.replace(/\r?\n|\r/g, '');
    textarea.style.height = '0px';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  afterUpdate(function () {
    autoHeight();
  });
  export const focus = () => {
    textarea.focus();
  };
</script>

<textarea
  bind:value
  bind:this={textarea}
  on:load={autoHeight}
  on:input={autoHeight}
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
    padding: var(--padding);
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
