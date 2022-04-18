<script lang="ts">
  import Text from './Text.svelte';
  import Icon from './Icon.svelte';
  import { getContext, onMount, tick } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { activeMouse, flows, selected, newBox } from './stores';
  import { Box } from './types';

  import { boxIn, boxOut, boxButtonIn, brIn, brOut } from './transition';

  const dispatch = createEventDispatcher();

  export let root = false;

  export let content: string = '';
  export let children: Box[];
  export let index: number;
  export let level: number;
  export let focus: boolean = false;
  export let parentPath: number[] = [];

  $: path = [...parentPath, index];

  export let addSibling: (
    childIndex: number,
    direction: number
  ) => boolean = () => false;
  export let deleteSelf: (childIndex: number) => void = () => {};
  export let focusSibling: (
    childIndex: number,
    direction: number
  ) => void = () => {};
  export let focusParent: () => void = () => {};
  export let dispatchSelfFocus: (
    childIndex: number,
    isFocused: boolean
  ) => void = () => {};

  const { getinvert } = getContext('invert');
  let invert: boolean = getinvert();

  const { getColumnCount } = getContext('columnCount');
  let columnCount: number = getColumnCount();

  let textarea: any = undefined;

  let backgroundColor: string;
  let childFocus: boolean = false;
  let childFocusIndex: number = -1;
  function onChildFocus(childIndex: number, isFocused: boolean) {
    if (isFocused) {
      childFocus = true;
      childFocusIndex = childIndex;
    } else if (childIndex == childFocusIndex) {
      childFocus = false;
      childFocusIndex = -1;
    }
  }
  let hasSentEdit: boolean = false;
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

  let placeholder: string = '';
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
    require: () => boolean;
    stopRepeat: boolean;
    preventDefault: boolean;
    blur: boolean;
    handle: (e: KeyboardEvent) => void;
    constructor(
      handle: () => void,
      require = () => true,
      stopRepeat = true,
      preventDefault = true,
      blur = true
    ) {
      this.require = require;
      this.stopRepeat = stopRepeat;
      this.preventDefault = preventDefault;
      this.blur = blur;
      this.handle = function (e: KeyboardEvent) {
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
  function handleKeydown(e: KeyboardEvent) {
    if (e.shiftKey && keyDowns.shift[e.key]) {
      keyDowns.shift[e.key].handle(e);
    } else if (keyDowns.other[e.key]) {
      keyDowns.other[e.key].handle(e);
    }
  }
  function handleBeforeinput(e: InputEvent) {
    if (!hasSentEdit) {
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

  function addChild(childIndex: number, direction: number): boolean {
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
      for (let i: number = newChildIndex; i < childrenClone.length; i++) {
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
  async function deleteChild(childIndex: number) {
    // if target isn't only child of first level
    if (children.length > 1 || level >= 1) {
      let childrenClone = [...children];
      // add to history
      $flows[$selected].history.add('delete', [...path, childIndex], {
        box: childrenClone[childIndex],
      });
      // unfocus target
      childrenClone[childIndex].focus = false;
      children = [...childrenClone];
      await tick();

      // delete target
      childrenClone.splice(childIndex, 1);
      // fix childIndex
      for (let i = 0; i < childrenClone.length; i++) {
        childrenClone[i].index = i;
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
      focusChild(0, 0);
      return false;
    }
  }
  function focusChild(childIndex: number, direction: number) {
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
  let palette: string;
  $: {
    if ((level % 2 == 0 && !invert) || (level % 2 == 1 && invert)) {
      palette = 'accent-secondary';
    } else {
      palette = 'accent';
    }
  }
  let outsidePalette: string;
  $: {
    if ((level % 2 == 0 && !invert) || (level % 2 == 1 && invert)) {
      outsidePalette = 'accent';
    } else {
      outsidePalette = 'accent-secondary';
    }
  }
</script>

<div
  class={`top palette-${palette}`}
  class:empty={children.length == 0}
  class:focus
  class:childFocus
  class:activeMouse={$activeMouse}
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

      <div class="text">
        <Text
          on:keydown={handleKeydown}
          on:beforeinput={handleBeforeinput}
          on:blur={handleBlur}
          on:focus={handleFocus}
          bind:value={content}
          bind:this={textarea}
          {placeholder}
        />
      </div>
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
        class={`add palette-${outsidePalette}`}
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
    display: grid;
    grid-template-areas: 'a b';
    grid-template-rows: min-content;
    width: max-content;
    height: auto;
    overflow: visible;
    align-items: start;
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
    color: var(--this-text);
  }
  .text {
    padding: var(--padding);
    position: relative;
  }

  .childFocus > .content,
  .activeMouse .content:hover {
    background: var(--this-background-indent);
  }
  :is(.focus, .activeMouse.focus) > .content {
    background: var(--this-background-active);
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
  .line {
    content: '';
    display: block;
    background-color: var(--this-background-indent);
    height: var(--line-width);
    margin-left: var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    border-radius: var(--border-radius-small);
    margin-top: calc(-0.5 * var(--line-width));
    position: absolute;
    transition: width var(--transition-speed), margin var(--transition-speed),
      background var(--transition-speed);
  }
  .line.below {
    margin-top: calc(-0.5 * var(--line-width));
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
  .activeMouse .line:hover {
    width: calc(var(--column-width));
    border-radius: 0;
    margin-left: 0;
  }
  .childFocus > .content > .barcontainer > .line,
  .activeMouse .content:hover > .barcontainer > .line {
    z-index: 2;

    background-color: var(--this-color-fade);
  }
  :is(.focus, .focus.activeMouse) > .content > .barcontainer > .line {
    z-index: 3;
    background-color: var(--this-color);
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
    padding: var(--padding);
    margin: calc(var(--line-width) / 2) var(--padding) 0 var(--padding);
    width: calc(var(--column-width) - var(--padding) * 2);
    background-color: var(--this-background);
    box-sizing: border-box;
    height: calc(1em + var(--padding) * 2);
  }
  .focus > .content > .add,
  .activeMouse .add:hover {
    opacity: 1;
  }
  .activeMouse .add:hover {
    background-color: var(--this-background-indent);
  }
  .add:active,
  .activeMouse .add:active {
    background-color: var(--this-background-active);
  }
</style>
