<script>
  import Text from './Text.svelte';
  import Button from './Button.svelte';
  import { afterUpdate } from 'svelte';

  import { createEventDispatcher } from 'svelte';

  export let flow;

  let textarea;
  afterUpdate(function () {
    if (flow.focus) {
      textarea.focus();
    }
  });
  function boxFromPath(path, scope) {
    if (!scope) {
      scope = 0;
    }
    let ret = flow;
    if (path.length > 1) {
      for (let i = 1; i < path.length - scope; i++) {
        ret = ret.children[path[i]];
      }
    }
    return ret;
  }

  let validFocus = false;
  function setValidFocus() {
    // wait until its actually done updating
    setTimeout(() => {
      if (flow.lastFocus && flow.lastFocus.length > 1) {
        let box = boxFromPath(flow.lastFocus);
        validFocus = box?.focus;
      }
    }, 0);
  }
  $: flow.lastFocus, setValidFocus();

  function handleBlur() {
    if (flow.focus) {
      delete flow.focus;
      flow = flow;
    }
  }

  function handleKeydown(e) {
    if (e.key == 'Enter' || e.key == 'ArrowDown') {
      e.preventDefault();
      if (flow.children.length > 0) {
        flow.children[0].focus = true;
      }
    }
  }
  function deleteChild() {
    // cancel if disabled
    if (!validFocus) return;
    let parent = boxFromPath(flow.lastFocus, 1);
    let target = boxFromPath(flow.lastFocus);
    let children = [...parent.children];
    // if target isn't only child of first level
    if (children.length > 1 || parent.level >= 1) {
      children.splice(target.index, 1);
      // fix index
      for (let i = target.index; i < children.length; i++) {
        children[i].index = i;
      }
      // focus parent when empty
      if (children.length <= 0) {
        parent.focus = true;
        // focus last child when last child deleted
      } else if (target.index >= children.length) {
        children[children.length - 1].focus = true;
        // focus next child of deleted
      } else {
        children[target.index].focus = true;
      }

      parent.children = [...children];
      flow = flow;
    }
  }

  function addChild() {
    // cancel if disabled
    if (!validFocus) return;
    // if not at end of column
    let target = boxFromPath(flow.lastFocus);
    let children = [...target.children];
    if (target.level < flow.columns.length) {
      children.splice(0, 0, {
        content: '',
        children: [],
        index: 0,
        level: target.level + 1,
        focus: false,
      });
      // fix index
      for (let i = 0; i < children.length; i++) {
        children[i].index = i;
      }

      target.children = [...children];
      flow = flow;
    }
  }
  function addSibling(direction) {
    // cancel if disabled
    if (!validFocus) return;
    let parent = boxFromPath(flow.lastFocus, 1);
    let target = boxFromPath(flow.lastFocus);
    let children = [...parent.children];
    children.splice(target.index + direction, 0, {
      content: '',
      children: [],
      index: target.index + direction,
      level: target.level,
      focus: false,
    });
    // fix index
    for (let i = target.index; i < children.length; i++) {
      children[i].index = i;
    }
    parent.children = [...children];
    flow = flow;
  }
</script>

<div class="top">
  <div class="content">
    <Text
      on:blur={handleBlur}
      on:keydown={handleKeydown}
      bind:value={flow.content}
      bind:this={textarea}
      nowrap
      placeholder="type name here"
    />
  </div>
  <div class="buttons-wrapper">
    <div class="buttons">
      <Button name="arrowRight" on:click={addChild} disabled={!validFocus} />
      <Button
        name="arrowUp"
        on:click={() => addSibling(0)}
        disabled={!validFocus}
      />
      <Button
        name="arrowDown"
        on:click={() => addSibling(1)}
        disabled={!validFocus}
      />
      <Button name="delete" on:click={deleteChild} disabled={!validFocus} />
    </div>
  </div>
</div>

<style>
  .top {
    padding: var(--padding);
    font-size: 2em;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: var(--title-height);
  }
  .content {
    width: 100%;
  }
  .buttons-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
</style>
