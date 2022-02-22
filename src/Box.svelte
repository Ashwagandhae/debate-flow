<script>
  import Text from './Text.svelte';
  import Icon from './Icon.svelte';
  import Overlay from './Overlay.svelte';
  import { getContext } from 'svelte';
  import { onMount } from 'svelte';
  import { afterUpdate } from 'svelte';
  import { beforeUpdate } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import { boxIn, boxOut, boxButtonIn, brIn, brOut } from './transition.js';

  const dispatch = createEventDispatcher();

  export let root = false;

  export let data;
  export let parentPath = [];

  $: path = [...parentPath, data.index];

  export let addSibling = () => {};
  export let deleteSelf = () => {};
  export let focusSibling = () => {};
  export let focusParent = () => {};

  let lineColor;
  let backgroundColor;
  let childFocus = false;
  function saveFocus(e) {
    if (e.detail.length - path.length == 1) {
      childFocus = true;
    }
    dispatch('saveFocus', e.detail);
  }
  $: {
    if (data.focus) {
      lineColor = 'var(--accent)';
      backgroundColor = 'var(--background-accent)';
    } else if (childFocus) {
      lineColor = 'var(--accent-fade)';
      backgroundColor = 'var(--background-accent-fade)';
    } else {
      lineColor = 'none';
      backgroundColor = 'none';
    }
  }
  $: highlight = childFocus || data.focus;

  const { getNeg } = getContext('neg');
  let neg = getNeg();

  const { getColumnCount } = getContext('columnCount');
  let columnCount = getColumnCount();

  let textarea;
  beforeUpdate(function () {
    childFocus = false;
  });
  afterUpdate(function () {
    if (data.focus && data.level >= 1) {
      textarea.focus();
      dispatch('saveFocus', path);
    }
  });

  let placeholder = '';
  $: {
    if (data.level == 1 && data.index == 0) {
      placeholder = 'type here';
    } else {
      placeholder = '';
    }
  }

  function preventBlur(e) {
    e.preventDefault();
  }

  function handleFocus() {
    if (!data.focus) {
      focusSelf();
    }
  }

  function handleBlur() {
    if (data.focus) {
      data.focus = false;
      data = data;
    }
  }
  class keyDown {
    constructor(
      handle,
      require = () => true,
      stopRepeat = true,
      preventDefault = true,
      keepFocus = false
    ) {
      this.require = require;
      this.preventDefault = preventDefault;
      this.keepFocus = keepFocus;
      this.stopRepeat = stopRepeat;
      this.handle = function (e) {
        if (!this.require()) {
          return false;
        }
        if (this.preventDefault) {
          e.preventDefault();
        }
        if (this.stopRepeat && e.repeat == true) {
          return false;
        }
        if (this.keepFocus) {
          focusSelf();
        }
        handle();
        return true;
      };
    }
  }
  const keyDowns = {
    shiftKey: {
      Enter: new keyDown(() => addChild(0, 0)),
    },
    other: {
      Enter: new keyDown(() => addSibling(data.index, 1)),
      Backspace: new keyDown(
        () => deleteSelf(data.index),
        () => data.content.length == 0
      ),

      ArrowUp: new keyDown(() => focusSibling(data.index, -1)),
      ArrowDown: new keyDown(() => focusSibling(data.index, 1)),
      ArrowLeft: new keyDown(() => focusParent()),
      ArrowRight: new keyDown(() => {
        if (data.children.length > 0) {
          focusChild(0, 0);
        } else {
          focusSibling(data.index, 1);
        }
      }),
    },
  };
  function handleKeydown(e) {
    if (e.shiftKey && keyDowns.shiftKey[e.key]) {
      keyDowns.shiftKey[e.key].handle(e);
    } else if (keyDowns.other[e.key]) {
      keyDowns.other[e.key].handle(e);
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
      focusSelf();
    }
  }
  function deleteChild(index) {
    // if target isn't only child of first level
    if (data.children.length > 1 || data.level >= 1) {
      let children = [...data.children];
      children[index].focus = false;
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
        focusSelf();
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
      focusSelf();
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
  class:highlight
  in:boxIn|local
  out:boxOut|local
>
  <div
    class="content"
    class:root
    style={`--this-background: ${backgroundColor}`}
    class:left={data.children.length > 0}
    class:right={data.index == 0 && data.level > 1}
  >
    <div class="barcontainer">
      <div
        class="line above"
        class:left={data.children.length > 0}
        class:right={data.index == 0 && data.level > 1}
        in:brIn|local
        out:brOut|local
      >
        <Overlay background={lineColor} />
      </div>

      <Text
        on:keydown={handleKeydown}
        on:blur={handleBlur}
        on:focus={handleFocus}
        bind:value={data.content}
        bind:this={textarea}
        {placeholder}
      />
      <div class="line below" in:brIn|local out:brOut|local>
        <Overlay background={lineColor} />
      </div>
    </div>
    {#if data.children.length == 0 && data.level < columnCount}
      <button
        class="add"
        on:click={() => addChild(0, 0)}
        on:mousedown={preventBlur}
        in:boxButtonIn|local
      >
        <Icon name="add" />
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
        on:saveFocus={saveFocus}
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
    grid-area: a;
    background: var(--this-background);
    transition: background var(--transition-speed);
    position: relative;
    border-radius: var(--border-radius-small);
  }
  .content.left {
    border-radius: var(--border-radius-small) 0 var(--border-radius-small)
      var(--border-radius-small);
  }
  .content.right {
    border-radius: 0 var(--border-radius-small) var(--border-radius-small)
      var(--border-radius-small);
  }
  .content.left.right {
    border-radius: 0 0 var(--border-radius-small) var(--border-radius-small);
  }
  .empty .content {
    width: max-content;
  }
  .root.content {
    display: none;
  }
  .line {
    z-index: -1;
  }
  .top.highlight > .content > .barcontainer > .line {
    z-index: 2;
  }
  .line {
    content: '';
    display: block;
    background-color: var(--this-background-indent);
    height: var(--br-height);
    margin-left: var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    border-radius: var(--border-radius-small);
    margin-top: calc(-0.5 * var(--br-height));
    position: absolute;
  }
  .line.below {
    margin-top: calc(-0.5 * var(--br-height));
  }
  .line.left {
    width: calc(var(--column-width) - var(--padding));
    border-radius: 3px 0 0 3px;
  }
  .line.right {
    width: calc(var(--column-width) - var(--padding));
    margin-left: 0;
    border-radius: 0 3px 3px 0;
  }
  .line.left.right {
    width: calc(var(--column-width));
    border-radius: 0;
    margin-left: 0;
  }

  .barcontainer {
    width: var(--column-width);
  }
  .children {
    grid-area: b;
    width: max-content;
    padding: 0;
    margin: 0;
  }
  .add {
    opacity: 0;
    transition: background var(--transition-speed);
    border: none;
    display: block;
    position: absolute;
    transform: translateX(var(--column-width));
    border-radius: var(--border-radius);
    --color: var(--color-weak);
    padding: var(--padding);
    margin: calc(var(--br-height) / 2) var(--padding) 0 var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
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
    transition: none;
    background-color: var(--this-outside-active);
  }
</style>
