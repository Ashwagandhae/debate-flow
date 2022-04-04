<script lang="ts">
  import Button from './Button.svelte';
  import ButtonBar from './ButtonBar.svelte';
  import { flows, selected, boxFromPath, newBox } from './stores';
  import { afterUpdate, tick } from 'svelte';
  import { Flow, Box } from './types';

  export let flow: Flow;

  let disabledReason: string = 'no cell selected';

  let validFocus: boolean = false;
  async function setValidFocus() {
    // wait until its actually done updating
    await tick();
    if (flow.lastFocus && flow.lastFocus.length > 1) {
      let box: Flow | Box = boxFromPath(flow.lastFocus);
      validFocus = box?.focus;
    }
  }
  // $: flow.lastFocus, setValidFocus();
  afterUpdate(function () {
    setValidFocus();
  });

  function deleteChild() {
    // cancel if disabled
    if (!validFocus) return;
    let parent: Box | Flow = boxFromPath(flow.lastFocus, 1);
    let target: Box = boxFromPath(flow.lastFocus);
    let children: Box[] = [...parent.children];
    // if target isn't only child of first level
    if (children.length > 1 || parent.level >= 1) {
      // add to history
      $flows[$selected].history.add('delete', flow.lastFocus, {
        box: children[target.index],
      });
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
    let target: Box = boxFromPath(flow.lastFocus);
    let children: Box[] = [...target.children];
    if (target.level < flow.columns.length) {
      children.splice(0, 0, newBox(0, target.level + 1, false));
      // fix index
      for (let i = 0; i < children.length; i++) {
        children[i].index = i;
      }
      // add to history
      $flows[$selected].history.add('add', [...flow.lastFocus, 0]);

      target.children = [...children];
      flow = flow;
    }
  }

  function addSibling(direction) {
    // cancel if disabled
    if (!validFocus) return;
    let parent: Flow | Box = boxFromPath(flow.lastFocus, 1);
    let target: Box = boxFromPath(flow.lastFocus);
    let children: Box[] = [...parent.children];
    children.splice(
      target.index + direction,
      0,
      newBox(target.index + direction, target.level, false)
    );
    // fix index
    for (let i = target.index; i < children.length; i++) {
      children[i].index = i;
    }
    // add to history
    let newPath = [...flow.lastFocus];
    if (direction == 0) {
      newPath[newPath.length - 1] -= 0;
      flow.lastFocus[flow.lastFocus.length - 1] += 1;
    } else {
      newPath[newPath.length - 1] += 1;
    }
    $flows[$selected].history.add('add', newPath);
    parent.children = [...children];
    flow = flow;
  }
  function preventBlur(e) {
    e.preventDefault();
  }
</script>

<div class="top" on:mousedown={preventBlur}>
  <div class="buttons-wrapper">
    <ButtonBar>
      <Button
        icon="undo"
        disabled={$flows[$selected].history.index == -1}
        on:click={() => $flows[$selected].history.undo()}
        tooltip="undo"
        shortcut={['cmd', 'z']}
        disabledReason="nothing to undo"
      />
      <Button
        disabled={$flows[$selected].history.index ==
          $flows[$selected].history.data.length - 1}
        icon="redo"
        on:click={() => $flows[$selected].history.redo()}
        tooltip="redo"
        shortcut={['cmd', 'shift', 'z']}
        disabledReason="nothing to redo"
      />
      <Button
        icon="addRight"
        on:click={addChild}
        disabled={!validFocus}
        {disabledReason}
        tooltip="add response"
        shortcut={['shift', 'enter']}
      />
      <Button
        icon="addUp"
        on:click={() => addSibling(0)}
        disabled={!validFocus}
        {disabledReason}
        tooltip="add arguement above"
      />
      <Button
        icon="addDown"
        on:click={() => addSibling(1)}
        disabled={!validFocus}
        {disabledReason}
        tooltip="add arguement below"
        shortcut={['enter']}
      />
      <Button
        icon="delete"
        on:click={deleteChild}
        disabled={!validFocus}
        {disabledReason}
        tooltip="delete selected"
      />
    </ButtonBar>
  </div>
</div>

<style>
  .buttons-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .top {
    padding: var(--padding);
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    height: var(--title-height);
  }
</style>
