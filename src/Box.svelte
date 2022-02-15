<script>
  import Text from './Text.svelte';
  import Icon from './Icon.svelte';
  import { getContext } from 'svelte';
  import { onMount } from 'svelte';
  import { afterUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import { boxIn } from './transition.js';
  import { boxOut } from './transition.js';
  import { boxButtonIn } from './transition.js';
  import { brIn } from './transition.js';
  import { brOut } from './transition.js';

  const dispatch = createEventDispatcher();

  export let root = false;

  export let data;
  export let parentPath = [];

  $: path = [...parentPath, data.index];

  export let addSibling = () => {};
  export let deleteSelf = () => {};
  export let focusSibling = () => {};
  export let focusParent = () => {};

  const { getNeg } = getContext('neg');
  let neg = getNeg();

  const { getColumnCount } = getContext('columnCount');
  let columnCount = getColumnCount();

  let textarea;
  afterUpdate(function () {
    if (data.focus) {
      textarea.focus();
      dispatch('saveFocus', path);
    }
  });
  let placeholder = '';
  $: {
    if (data.level == 1 && data.index == 0) {
      placeholder = 'type here';
    }
  }
  function preventBlur(e) {
    e.preventDefault();
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
        addChild(0, 0);
      } else {
        data.focus = false;
        addSibling(data.index, 1);
      }
    } else if (e.key == 'Backspace') {
      if (data.content.length == 0) {
        data.focus = false;
        deleteSelf(data.index);
      }
    } else if (e.key == 'ArrowDown') {
      e.preventDefault();

      data.focus = false;
      focusSibling(data.index, 1);
    } else if (e.key == 'ArrowUp') {
      e.preventDefault();

      data.focus = false;
      focusSibling(data.index, -1);
    } else if (e.key == 'ArrowLeft') {
      data.focus = false;
      e.preventDefault();

      focusParent();
    } else if (e.key == 'ArrowRight') {
      e.preventDefault();

      data.focus = false;

      if (data.children.length > 0) {
        focusChild(0, 0);
      } else {
        focusSibling(data.index, 1);
      }
    }
  }
  function addChild(index, direction) {
    let newIndex = index + direction;
    // if not at end of column
    if (data.level < columnCount) {
      let children = [...data.children];

      children.splice(newIndex, 0, {
        content: '',
        children: [],
        index: newIndex,
        level: data.level + 1,
        focus: true,
      });
      for (let i = newIndex; i < children.length; i++) {
        children[i].index = i;
      }
      data.children = [...children];
      data = data;
    } else {
      // stay focused
      data.focus = true;
    }
  }
  function deleteChild(index) {
    // if target isn't only child of first level
    if (data.children.length > 1 || data.level >= 1) {
      let children = [...data.children];
      children.splice(index, 1);
      // fix index
      for (let i = index; i < children.length; i++) {
        children[i].index = i;
      }

      // focus on previous child of deleted
      if (children[index - 1]) {
        children[index - 1].focus = true;
        // focus on parent when empty
      } else if (children.length == 0) {
        data.focus = true;
        // focus on first child if deleted first child
      } else if (index - 1 < 0) {
        children[0].focus = true;
      }
      data.children = [...children];
    } else {
      // stay focused
      data.children[index].focus = true;
    }
    data = data;
  }
  function focusChild(index, direction) {
    let newIndex = index + direction;
    // focus on parent when index is before children
    if (newIndex < 0) {
      data.focus = true;
      return;
    }
    // direct pointer
    let children = data.children;
    // if index is beyond children
    if (newIndex >= children.length) {
      // if has grandchild
      if (children[children.length - 1].children.length > 0) {
        // focus on first grandchild

        children[children.length - 1].children[0].focus = true;
      } else {
        // stay focused
        children[index].focus = true;
      }
    } else {
      // focus on new
      children[newIndex].focus = true;
    }
    data.children = children;
    data = data;
  }
  function focusSelf() {
    data.focus = true;
    data = data;
  }
</script>

<div
  class="top"
  class:empty={data.children.length == 0}
  class:two={(data.level % 2 == 0 && !neg) || (data.level % 2 == 1 && neg)}
  class:focus={data.focus}
  in:boxIn|local
  out:boxOut|local
>
  <div class="content" class:root>
    <div class="barcontainer">
      <br
        class="above"
        class:left={data.children.length > 0}
        class:right={data.index == 0 && data.level > 1}
      />
      <div>
        <Text
          on:keydown={handleKeydown}
          on:blur={handleBlur}
          on:focus={handleFocus}
          bind:value={data.content}
          bind:this={textarea}
          {placeholder}
        />
      </div>
      <br class="below" in:brIn|local out:brOut|local />
    </div>
    {#if data.children.length == 0 && data.level < columnCount}
      <button
        class="add"
        on:click={() => addChild(0, 0)}
        on:mousedown={preventBlur}
        in:boxButtonIn|local
      >
        <Icon name="arrowRight" />
      </button>
    {/if}
  </div>

  <ul class="children">
    {#each data.children as child, index (child)}
      <svelte:self
        bind:data={child}
        addSibling={addChild}
        deleteSelf={deleteChild}
        focusSibling={focusChild}
        focusParent={focusSelf}
        parentPath={path}
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
    display: grid;
    grid-template-areas: 'a b';
    grid-template-rows: min-content;
    width: max-content;
    height: auto;
    overflow: visible;
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
    display: block;
    background-color: var(--this-background-indent);
    height: var(--br-height);
    margin-left: var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    border-radius: 3px;
    margin-top: calc(-0 * var(--br-height) / 2);
    position: absolute;
    z-index: 2;
  }
  br.below {
    margin-top: calc(0 * var(--br-height) / 2);
  }
  br.left {
    width: calc(var(--column-width) - var(--padding));
    border-radius: 3px 0 0 3px;
  }
  br.right {
    width: calc(var(--column-width) - var(--padding));
    margin-left: 0;
    border-radius: 0 3px 3px 0;
  }
  br.left.right {
    width: calc(var(--column-width));
    border-radius: 0;
    margin-left: 0;
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
    display: block;
    position: absolute;
    transform: translateX(var(--column-width));
    border-radius: var(--border-radius);
    --color: var(--color-weak);
    padding: var(--padding);
    margin: var(--br-height) var(--padding) 0 var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    z-index: 0;
    background-color: var(--this-outside);
    box-sizing: border-box;
    height: calc(1em + var(--padding) * 2);
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
