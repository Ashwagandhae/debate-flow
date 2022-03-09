<script>
  import Text from './Text.svelte';
  import Icon from './Icon.svelte';
  import Overlay from './Overlay.svelte';
  import { getContext, onMount } from 'svelte';
  import { afterUpdate, beforeUpdate, tick } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { flows, selected, newBox } from './stores.js';

  import { boxIn, boxOut, boxButtonIn, brIn, brOut } from './transition.js';

  const dispatch = createEventDispatcher();

  export let root = false;

  export let content;
  export let children;
  export let index;
  export let level;
  export let focus;
  export let parentPath = [];

  $: path = [...parentPath, index];

  export let addSibling = () => {};
  export let deleteSelf = () => {};
  export let focusSibling = () => {};
  export let focusParent = () => {};
  export let dispatchSelfFocus = () => {};

  const { getinvert } = getContext('invert');
  let invert = getinvert();

  const { getColumnCount } = getContext('columnCount');
  let columnCount = getColumnCount();

  let textarea;

  let lineColor;
  let backgroundColor;
  let childFocus = false;
  let childFocusIndex = -1;
  function onChildFocus(childIndex, isFocused) {
    if (isFocused) {
      childFocus = true;
      childFocusIndex = childIndex;
    } else if (childIndex == childFocusIndex) {
      childFocus = false;
      childFocusIndex = -1;
    }
  }
  $: {
    if (focus) {
      lineColor = 'var(--this-accent)';
      backgroundColor = 'var(--this-background-accent)';
    } else if (childFocus) {
      lineColor = 'var(--this-accent-fade)';
      backgroundColor = 'var(--this-background-accent-fade)';
    } else {
      lineColor = 'none';
      backgroundColor = 'none';
    }
  }
  let hasSentEdit = false;
  function focusChange() {
    if (focus) {
      dispatchSelfFocus(index, true);
      if (level >= 1) {
        $flows[$selected].history.addFocus([...path]);
        dispatch('saveFocus', path);
        textarea && textarea.focus();
      }
    } else {
      dispatchSelfFocus(index, false);
      hasSentEdit = false;
    }
  }
  onMount(focusChange);
  $: focus, focusChange();

  function pathChange() {
    if (focus) {
      dispatchSelfFocus(index, true);
      $flows[$selected].history.addFocus([...path]);
    }
  }
  $: path, pathChange();

  let placeholder = '';
  $: {
    if (level == 1 && index == 0) {
      placeholder = 'type here';
    } else {
      placeholder = '';
    }
  }

  function preventBlur(e) {
    e.preventDefault();
  }

  function handleFocus() {
    if (!focus) {
      focusSelf();
    }
  }

  function handleBlur() {
    if (focus) {
      focus = false;
    }
  }
  class keyDown {
    constructor(
      handle,
      require = () => true,
      stopRepeat = true,
      preventDefault = true,
      blur = true
    ) {
      this.require = require;
      this.stopRepeat = stopRepeat;
      this.preventDefault = preventDefault;
      this.blur = blur;
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
        if (this.blur) {
          focus = false;
        }
        handle();
        return true;
      };
    }
  }
  const keyDowns = {
    shift: {
      Enter: new keyDown(() => {
        addChild(0, 0) && focusChild(0, 0);
      }),
    },
    other: {
      Enter: new keyDown(() => {
        addSibling(index, 1) && focusSibling(index, 1);
      }),
      Backspace: new keyDown(
        () => {
          deleteSelf(index);
        },
        // only delete if content is empty
        () => content.length == 0
      ),

      ArrowUp: new keyDown(() => focusSibling(index, -1)),
      ArrowDown: new keyDown(() => focusSibling(index, 1)),
      ArrowLeft: new keyDown(() => focusParent()),
      ArrowRight: new keyDown(() => {
        if (children.length > 0) {
          focusChild(0, 0);
        } else {
          focusSibling(index, 1);
        }
      }),
    },
  };
  function handleKeydown(e) {
    if (e.shiftKey && keyDowns.shift[e.key]) {
      keyDowns.shift[e.key].handle(e);
    } else if (keyDowns.other[e.key]) {
      keyDowns.other[e.key].handle(e);
    }
  }
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

  function addChild(childIndex, direction) {
    let newChildIndex = childIndex + direction;
    // if not at end of column
    if (level < columnCount) {
      let childrenClone = [...children];
      childrenClone.splice(
        newChildIndex,
        0,
        newBox(newChildIndex, level + 1, true)
      );
      // fix childIndex
      for (let i = newChildIndex; i < childrenClone.length; i++) {
        childrenClone[i].index = i;
      }
      // add to history
      $flows[$selected].history.add('add', [...path, newChildIndex]);

      children = [...childrenClone];
      return true;
    } else {
      // stay focused
      focusSelf();
      return false;
    }
  }
  function deleteChild(childIndex) {
    // if target isn't only child of first level
    if (children.length > 1 || level >= 1) {
      let childrenClone = [...children];
      // add to history
      $flows[$selected].history.add('delete', [...path, childIndex], {
        box: childrenClone[childIndex],
      });
      childrenClone[childIndex].focus = false;
      childrenClone.splice(childIndex, 1);
      // fix childIndex
      for (let i = childIndex; i < childrenClone.length; i++) {
        childrenClone[i].childIndex = i;
      }
      children = [...childrenClone];
      // focus on previous child of deleted
      if (children[childIndex - 1]) {
        focusChild(childIndex - 1, 0);
        // focus on parent when empty
      } else if (children.length == 0) {
        focusSelf();
        // focus on first child if deleted first child
      } else if (childIndex == 0) {
        focusChild(0, 0);
      }
      return true;
    } else {
      return false;
    }
  }
  function focusChild(childIndex, direction) {
    let newChildIndex = childIndex + direction;
    // focus on parent when childIndex is before children
    if (newChildIndex < 0) {
      focusSelf();
      return;
    }
    // if childIndex is beyond children
    if (newChildIndex >= children.length) {
      // if has grandchild
      if (children[children.length - 1].children.length > 0) {
        // focus on first grandchild
        children[children.length - 1].children[0].focus = true;
      } else {
        // stay focused
        children[childIndex].focus = true;
      }
    } else {
      // focus on new
      children[newChildIndex].focus = true;
    }
    children = children;
  }
  function focusSelf() {
    focus = true;
  }
</script>

<div
  class="top"
  class:empty={children.length == 0}
  class:secondary={(level % 2 == 0 && !invert) || (level % 2 == 1 && invert)}
  class:focus
  class:childFocus
  class:highlight={childFocus || focus}
  in:boxIn|local
  out:boxOut|local
>
  <div
    class="content"
    class:root
    style={`--this-background: ${backgroundColor}`}
    class:left={children.length > 0}
    class:right={index == 0 && level > 1}
  >
    <div class="barcontainer">
      <div
        class="line above"
        class:left={children.length > 0}
        class:right={index == 0 && level > 1}
        in:brIn|local
        out:brOut|local
        on:click={() => {
          addSibling(index, 0) && focusSibling(index, 0);
        }}
        on:mousedown={preventBlur}
      >
        <!-- <Overlay background={lineColor} /> -->
      </div>

      <Text
        on:keydown={handleKeydown}
        on:beforeinput={handleBeforeinput}
        on:blur={handleBlur}
        on:focus={handleFocus}
        bind:value={content}
        bind:this={textarea}
        {placeholder}
      />
      <div
        class="line below"
        in:brIn|local
        out:brOut|local
        on:click={() => {
          addSibling(index, 1) && focusSibling(index, 1);
        }}
        on:mousedown={preventBlur}
      >
        <!-- <Overlay background={lineColor} /> -->
      </div>
    </div>
    {#if children.length == 0 && level < columnCount}
      <button
        class="add"
        on:click={() => {
          addChild(0, 0);
          focusChild(0, 0);
        }}
        on:mousedown={preventBlur}
        in:boxButtonIn|local
      >
        <Icon name="add" />
      </button>
    {/if}
  </div>

  <ul class="children">
    {#each children as child, childIndex (child)}
      <svelte:self
        bind:content={child.content}
        bind:children={child.children}
        bind:index={child.index}
        bind:level={child.level}
        bind:focus={child.focus}
        addSibling={addChild}
        deleteSelf={deleteChild}
        focusSibling={focusChild}
        focusParent={focusSelf}
        dispatchSelfFocus={onChildFocus}
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

    --this-color: var(--accent-text);

    --this-background-accent: var(--background-accent);
    --this-background-accent-fade: var(--background-accent-fade);
    --this-accent: var(--accent);
    --this-accent-fade: var(--accent-fade);
  }
  .top.secondary {
    --this-background-indent: var(--background-secondary-indent);
    --this-background-active: var(--background-secondary-active);

    --this-outside: var(--background);
    --this-outside-indent: var(--background-indent);
    --this-outside-active: var(--background-active);

    --this-color: var(--accent-secondary-text);

    --this-background-accent: var(--background-accent-secondary);
    --this-background-accent-fade: var(--background-accent-secondary-fade);
    --this-accent: var(--accent-secondary);
    --this-accent-fade: var(--accent-secondary-fade);
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
    color: var(--this-color);
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
    transition: width var(--transition-speed), margin var(--transition-speed),
      background var(--transition-speed);
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
  .line.left.right,
  .line:hover {
    width: calc(var(--column-width));
    border-radius: 0;
    margin-left: 0;
  }
  .focus > .content > .barcontainer > .line {
    background-color: var(--this-accent);
  }
  .focus > .content > .barcontainer > .line:hover {
    background-color: var(--this-color);
  }
  .childFocus > .content > .barcontainer > .line {
    background-color: var(--this-accent-fade);
  }
  .childFocus > .content > .barcontainer > .line:hover {
    background-color: var(--this-accent);
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
