<script>
  import Text from './Text.svelte';
  import { getContext } from 'svelte';
  import { onMount } from 'svelte';
  import { afterUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let root = false;

  export let data;

  const { getNeg } = getContext('neg');
  let neg = getNeg();

  const { getColumnCount } = getContext('columnCount');
  let columnCount = getColumnCount();

  let textarea;
  afterUpdate(function () {
    if (data.focus) {
      textarea.focus();
      dispatch('saveFocus', data);
    }
  });
  function handleFocus() {
    data.focus = true;
  }

  function handleBlur() {
    if (data.focus) {
      delete data.focus;
      data = data;
    }
  }

  function handleKeydown(e) {
    if (e.key == 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        addChild(0);
      } else {
        dispatch('addSibling', data.index + 1);
      }
    } else if (e.key == 'Backspace' && data.content.length <= 0) {
      e.preventDefault();
      dispatch('deleteSelf', data.index);
    } else if (e.key == 'ArrowDown') {
      dispatch('focusSibling', data.index + 1);
    } else if (e.key == 'ArrowUp') {
      dispatch('focusSibling', data.index - 1);
    } else if (e.key == 'ArrowLeft') {
      dispatch('focusParent');
    } else if (e.key == 'ArrowRight') {
      if (data.children.length > 0) {
        data.children[0].focus = true;
      } else {
        dispatch('focusSibling', data.index + 1);
      }
    }
  }
  function addChild(index) {
    if (data.level >= columnCount) {
      return;
    }

    data.children.splice(index, 0, {
      content: '',
      children: [],
      index: index,
      level: data.level + 1,
      focus: true,
    });
    for (let i = 0; i < data.children.length; i++) {
      data.children[i].index = i;
    }
    data = data;
  }
  function deleteChild(index) {
    if (data.children.length > 1 || data.level >= 1) {
      data.children.splice(index, 1);

      for (let i = 0; i < data.children.length; i++) {
        data.children[i].index = i;
      }
      if (data.children[index - 1]) {
        data.children[index - 1].focus = true;
      }
      if (data.children.length == 0) {
        data.focus = true;
      }
      data = data;
    }
  }
  function focusSibling(index) {
    if (index < 0) {
      data.focus = true;
      return;
    }
    if (index >= data.children.length) {
      if (data.children[data.children.length - 1].children.length > 0) {
        data.children[data.children.length - 1].children[0].focus = true;
      }
      return;
    }
    data.children[index].focus = true;
    data = data;
  }
  function focusParent() {
    data.focus = true;
  }
  function focusChild() {
    if (data.children.length > 0) {
      data.children[0].focus = true;
    }
  }
</script>

<div
  class="top"
  class:empty={data.children.length == 0}
  class:two={(data.level % 2 == 0 && !neg) || (data.level % 2 == 1 && neg)}
  class:focus={data.focus}
>
  <div class="content" class:root>
    <div class="barcontainer">
      <br />
      <Text
        on:keydown={handleKeydown}
        on:blur={handleBlur}
        on:focus={handleFocus}
        bind:value={data.content}
        bind:this={textarea}
        placeholder="type content here"
      />
      <br class="bottom" />
    </div>
    {#if data.children.length == 0 && data.level < columnCount}
      <button class="add" on:click={() => addChild(0)}>+</button>
    {/if}
  </div>

  <ul class="children">
    {#each data.children as child (child.index)}
      <svelte:self
        bind:data={child}
        on:addSibling={(e) => addChild(e.detail)}
        on:deleteSelf={(e) => deleteChild(e.detail)}
        on:focusSibling={(e) => focusSibling(e.detail)}
        on:focusParent={focusParent}
        on:saveFocus
      />
    {/each}
  </ul>
</div>

<style>
  .top {
    --this-background-indent: var(--background-indent);
    --this-background-active: var(--background-active);

    --this-outside: var(--background-secondary);
    --this-outside-indent: var(--background-secondary-indent);
    --this-outside-active: var(--background-secondary-active);
  }
  .top.two {
    --this-background-indent: var(--background-secondary-indent);
    --this-background-active: var(--background-secondary-active);

    --this-outside: var(--background);
    --this-outside-indent: var(--background-indent);
    --this-outside-active: var(--background-active);
  }

  .top {
    display: flex;
    flex-direction: row;
    width: max-content;
    justify-content: space-around;
    height: auto;
    color: var(--color);
  }
  .content {
    width: var(--column-width);
    flex-direction: row;
    display: flex;
    position: relative;
  }
  br {
    content: '';
    position: absolute;
    background-color: var(--this-background-indent);
    height: var(--br-height);
    margin-left: 10px;
    width: calc(var(--column-width) - 20px);
    border-radius: 3px;
  }
  br.bottom {
    display: none;
  }
  .barcontainer {
    width: var(--column-width);
  }
  .top:last-child > .content > .barcontainer > br.bottom {
    display: block;
  }
  .empty .content {
    width: max-content;
  }
  .root.content {
    display: none;
  }
  .children {
    width: max-content;
    padding: 0;
    margin: 0;
  }
  .add {
    opacity: 0;
    border: none;
    border-radius: var(--border-radius);
    color: var(--color-weak);
    padding: var(--padding);
    margin: 0 var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    z-index: 0;
    background-color: var(--this-outside);
    box-sizing: border-box;
    height: calc(1em + var(--padding) * 2 + var(--br-height) * 1);
  }
  .focus .add,
  .add:hover {
    opacity: 1;
  }
  .add:hover {
    background-color: var(--this-outside-indent);
    color: var(--color);
  }
  .add:active {
    background-color: var(--this-outside-active);
  }
</style>
