<script>
  import Text from './Text.svelte';
  import Button from './Button.svelte';
  import { afterUpdate } from 'svelte';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let flow;

  let textarea;
  let validFocus = false;
  afterUpdate(function () {
    if (flow.focus) {
      textarea.focus();
    }
  });
  function setValidFocus() {
    // it works ok
    setTimeout(() => {
      if (flow.lastFocus) {
        let { parent, index } = flow.lastFocus;
        validFocus = parent?.children[index]?.focus;
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
      dispatch('focusFlow');
    }
  }
  function deleteChild() {
    let { parent, index } = flow.lastFocus;
    if (!(parent.children[index].level == 1 && parent.children.length == 1)) {
      parent.children.splice(index, 1);
      for (let i = index; i < parent.children.length; i++) {
        parent.children[i].index = i;
      }
      let newIndex = index;
      if (index != 0) {
        newIndex = index - 1;
      }
      if (parent.children[newIndex]) {
        parent.children[newIndex].focus = true;
        parent.children = parent.children;
      } else {
        parent.focus = true;
      }
    } else {
      parent.children[index].focus = true;
    }
    flow = flow;
  }

  function addChild() {
    let { parent, index } = flow.lastFocus;
    let children = parent.children[index].children;
    children.splice(0, 0, {
      content: '',
      children: [],
      index: index,
      level: parent.level + 1,
      focus: false,
    });
    for (let i = index; i < children.length; i++) {
      children[i].index = i;
    }
    parent.children[index].children = children;
    flow = flow;
  }
  function addSibling(direction) {
    let { parent, index } = flow.lastFocus;
    let children = parent.children;
    index = index + direction;
    children.splice(index, 0, {
      content: '',
      children: [],
      index: index,
      level: parent.level + 1,
      focus: false,
    });
    for (let i = index; i < children.length; i++) {
      children[i].index = i;
    }
    parent.children = children;
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
