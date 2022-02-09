<script>
  import { afterUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

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
  on:keydown
  on:blur
  spellcheck="false"
  {placeholder}
  style={`--white-space:${whiteSpaceCss};`}
/>

<style>
  textarea {
    resize: none;
    outline: none;
    display: block;
    overflow-y: hidden;
    margin: 0;

    width: 100%;

    background: none;
    padding: var(--padding);
    border: none;
    border-radius: 0;
    font-size: inherit;
    color: inherit;
    white-space: var(--white-space);
  }
  textarea:focus {
    z-index: 10000;
  }
  textarea::placeholder {
    color: var(--color-weak);
  }
</style>
