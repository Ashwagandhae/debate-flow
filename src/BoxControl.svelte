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

  async function deleteChild() {
    // cancel if disabled
    if (!validFocus) return;
    let parent: Box | Flow = boxFromPath(flow.lastFocus, 1);
    let target: Box = boxFromPath(flow.lastFocus);
    let childrenClone: Box[] = [...parent.children];
    // if target isn't only child of first level
    if (childrenClone.length > 1 || parent.level >= 1) {
      // add to history
      flow.history.add('delete', flow.lastFocus, {
        box: childrenClone[target.index],
      });
      // unfocus target
      childrenClone[target.index].focus = false;
      parent.children = [...childrenClone];
      flow = flow;
      await tick();

      // delete target
      childrenClone.splice(target.index, 1);
      // fix index
      for (let i = target.index; i < childrenClone.length; i++) {
        childrenClone[i].index = i;
      }
      // focus parent when empty
      if (childrenClone.length <= 0) {
        parent.focus = true;
        // focus last child when last child deleted
      } else if (target.index >= childrenClone.length) {
        childrenClone[childrenClone.length - 1].focus = true;
        // focus next child of deleted
      } else {
        childrenClone[target.index].focus = true;
      }

      parent.children = [...childrenClone];
      flow = flow;
    }
  }

  function addChild() {
    // cancel if disabled
    if (!validFocus) return;
    // if not at end of column
    let target: Box = boxFromPath(flow.lastFocus);
    let childrenClone: Box[] = [...target.children];
    if (target.level < flow.columns.length) {
      childrenClone.splice(0, 0, newBox(0, target.level + 1, false));
      // fix index
      for (let i = 0; i < childrenClone.length; i++) {
        childrenClone[i].index = i;
      }
      // add to history
      flow.history.add('add', [...flow.lastFocus, 0]);

      target.children = [...childrenClone];
      flow = flow;
    }
  }

  function addSibling(direction) {
    // cancel if disabled
    if (!validFocus) return;
    let parent: Flow | Box = boxFromPath(flow.lastFocus, 1);
    let target: Box = boxFromPath(flow.lastFocus);
    let childrenClone: Box[] = [...parent.children];
    childrenClone.splice(
      target.index + direction,
      0,
      newBox(target.index + direction, target.level, false)
    );
    // fix index
    for (let i = target.index; i < childrenClone.length; i++) {
      childrenClone[i].index = i;
    }
    // add to history
    let newPath = [...flow.lastFocus];
    if (direction == 0) {
      newPath[newPath.length - 1] -= 0;
      flow.lastFocus[flow.lastFocus.length - 1] += 1;
    } else {
      newPath[newPath.length - 1] += 1;
    }
    flow.history.add('add', newPath);
    parent.children = [...childrenClone];
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
        disabled={flow.history.index == -1}
        on:click={() => flow.history.undo()}
        tooltip="undo"
        shortcut={['command', 'z']}
        disabledReason="nothing to undo"
      />
      <Button
        disabled={flow.history.index == flow.history.data.length - 1}
        icon="redo"
        on:click={() => flow.history.redo()}
        tooltip="redo"
        shortcut={['command', 'shift', 'z']}
        disabledReason="nothing to redo"
      />
      <Button
        icon="addRight"
        on:click={addChild}
        disabled={!validFocus}
        {disabledReason}
        tooltip="add response"
        shortcut={['shift', 'return']}
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
        shortcut={['return']}
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
