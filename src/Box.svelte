<script>
  import Text from './Text.svelte';
  import Icon from './Icon.svelte';
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
      console.log('bruh');
      textarea.focus();
      dispatch('saveChildFocus', data.index);
    }
  });
  function preventBlur(e) {
    e.preventDefault();
  }
  function saveFocus(index) {
    dispatch('saveFocus', { parent: data, index: index });
  }
  function handleFocus() {
    if (!data.focus) {
      data.focus = true;
      data = data;
    }
  }

  function handleBlur() {
    if (data.focus) {
      data.focus = false;
      data = data;
    }
  }

  function handleKeydown(e) {
    if (e.key == 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        data.focus = false;
        addChild(0);
      } else {
        data.focus = false;
        dispatch('addSibling', data.index + 1);
      }
    } else if (e.key == 'Backspace') {
      if (data.content.length == 0) {
        data.focus = false;
        dispatch('deleteSelf', data.index);
      }
    } else if (e.key == 'ArrowDown') {
      data.focus = false;
      dispatch('focusSibling', data.index + 1);
    } else if (e.key == 'ArrowUp') {
      data.focus = false;
      dispatch('focusSibling', data.index - 1);
    } else if (e.key == 'ArrowLeft') {
      data.focus = false;
      dispatch('focusParent');
    } else if (e.key == 'ArrowRight') {
      data.focus = false;

      if (data.children.length > 0) {
        data.children[0].focus = true;
      } else {
        dispatch('focusSibling', data.index + 1);
      }
    }
  }
  function addChild(index) {
    let children = [...data.children];
    children.splice(index, 0, {
      content: '',
      children: [],
      index: index,
      level: data.level + 1,
      focus: true,
    });
    for (let i = index; i < children.length; i++) {
      children[i].index = i;
    }
    data.children = children;
  }
  function deleteChild(index) {
    if (data.children.length > 1 || data.level >= 1) {
      let children = [...data.children];
      children.splice(index, 1);
      for (let i = index; i < children.length; i++) {
        children[i].index = i;
      }
      if (children[index - 1]) {
        children[index - 1].focus = true;
      }
      data.children = children;

      if (data.children.length == 0) {
        data.focus = true;
        data = data;
      }
    } else {
      data.children[index].focus = true;
    }
  }
  function focusChild(index) {
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
  function focusSelf() {
    data.focus = true;
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
      <br
        class="above"
        class:left={data.children.length > 0}
        class:right={data.index == 0 && data.level > 1}
      />
      <Text
        on:keydown={handleKeydown}
        on:blur={handleBlur}
        on:focus={handleFocus}
        bind:value={data.content}
        bind:this={textarea}
        placeholder="type content here"
      />
      <br class="below" />
    </div>
    {#if data.children.length == 0 && data.level < columnCount}
      <button
        class="add"
        on:click={() => addChild(0)}
        on:mousedown={preventBlur}
      >
        <Icon name="arrowRight" />
      </button>
    {/if}
  </div>

  <ul class="children">
    {#each data.children as child}
      <svelte:self
        bind:data={child}
        on:addSibling={(e) => addChild(e.detail)}
        on:deleteSelf={(e) => deleteChild(e.detail)}
        on:focusSibling={(e) => focusChild(e.detail)}
        on:saveChildFocus={(e) => saveFocus(e.detail)}
        on:saveFocus
        on:focusParent={focusSelf}
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
    display: grid;
    grid-template-areas: 'a b';
    grid-template-rows: min-content;
    width: max-content;
    height: auto;
    align-items: start;
    color: var(--color);
  }
  .content {
    width: var(--column-width);
    height: min-content;
    flex-direction: row;
    display: flex;
    position: relative;
    grid-area: a;
  }
  .empty .content {
    width: max-content;
  }
  .root.content {
    display: none;
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
  br.left {
    width: calc(var(--column-width) - 10px);
    border-radius: 3px 0 0 3px;
  }
  br.right {
    width: calc(var(--column-width) - 10px);
    margin-left: 0;
    border-radius: 0 3px 3px 0;
  }
  br.left.right {
    width: calc(var(--column-width));
    border-radius: 0;
    margin-left: 0;
  }
  br.below {
    display: none;
  }
  .barcontainer {
    width: var(--column-width);
  }
  .top:last-child > .content > .barcontainer > br.below {
    display: block;
  }
  .children {
    grid-area: b;
    width: max-content;
    padding: 0;
    margin: 0;
  }
  .add {
    opacity: 0;
    border: none;
    border-radius: var(--border-radius);
    --color: var(--color-weak);
    padding: var(--padding);
    margin: 0 var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    z-index: 0;
    background-color: var(--this-outside);
    box-sizing: border-box;
    height: calc(1em + var(--padding) * 2 + var(--br-height) * 1);
  }
  .focus > .content > .add,
  .add:hover {
    opacity: 1;
  }
  .add:hover {
    background-color: var(--this-outside-indent);
    --color: inherit;
  }
  .add:active {
    background-color: var(--this-outside-active);
  }
</style>
