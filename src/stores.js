import { writable } from 'svelte/store';

export const flows = writable([]);
export let selected = writable(0);
export const flowTypes = writable({
  aff: {
    columns: ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
    invert: false,
  },
  neg: {
    columns: ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
    invert: true,
  },
});

let $flows;
flows.subscribe((value) => {
  $flows = value;
});

let $flowTypes;
flowTypes.subscribe((value) => {
  $flowTypes = value;
});

export function newBox(index, level, focus) {
  return {
    content: '',
    children: [],
    index: index,
    level: level,
    focus: focus,
  };
}
export function newFlow(index, type) {
  return {
    content: '',
    level: 0,
    columns: $flowTypes[type].columns,
    invert: $flowTypes[type].invert,
    focus: true,
    index: index,
    lastFocus: undefined,
    children: [newBox(0, 1, false)],
    history: new History(),
  };
}

export function boxFromPath(path, scope) {
  if (!scope) {
    scope = 0;
  }
  let ret = { children: $flows };
  for (let i = 0; i < path.length - scope; i++) {
    ret = ret.children[path[i]];
  }

  return ret;
}
let $selected;

export class History {
  constructor() {
    this.index = -1;
    this.data = [];
    this.lastFocus = undefined;
  }
  lastAction() {
    return this.data[this.index];
  }
  add(type, path, other) {
    this.resolveAllPending();
    let action = {
      type: type,
      path: path,
      lastFocus: [...this.lastFocus],
      nextFocus: undefined,
    };
    if (action.type == 'delete') {
      action.box = { ...other.box };
    }

    this.data = this.data.slice(0, this.index + 1);
    this.data.push(action);
    this.index = this.data.length - 1;
  }
  addPending(type, path, other) {
    this.data = this.data.slice(0, this.index + 1);
    this.data.push({
      type: type,
      pending: true,
      path: path,
      other: other,
    });
    this.index = this.data.length - 1;
  }
  resolveAllPending() {
    let actionHappened = false;
    for (let i = 0; i < this.data.length; i++) {
      let pendingAction = this.data[i];
      if (pendingAction.pending) {
        let action = {
          type: pendingAction.type,
          path: pendingAction.path,
          lastFocus: pendingAction.path,
          nextFocus: pendingAction.path,
        };
        let shouldAdd = true;
        if (action.type == 'edit') {
          action.lastContent = pendingAction.other.lastContent;
          action.nextContent = pendingAction.other.getNextContent();
          if (action.lastContent == action.nextContent) {
            shouldAdd = false;
          }
          pendingAction.other.createEditBreak();
        }
        if (shouldAdd) {
          actionHappened = true;
          this.data[i] = action;
        } else {
          this.data[i] = null;
          if (this.index >= i) {
            this.index -= 1;
          }
        }
      }
    }
    this.data = this.data.filter((el) => el != null);
    if (actionHappened) {
      console.log('resolving all pending');
    }
  }
  addFocus(path) {
    this.lastFocus = path;
    if (this.lastAction()) {
      if (this.lastAction().nextFocus == undefined) {
        this.lastAction().nextFocus = path;
      }
    }
  }
  undoAction(action) {
    console.log('undo', this.index, this.data);
    let parent = boxFromPath(action.path, 1);
    let childIndex = action.path[action.path.length - 1];
    let children = [...parent.children];
    // do opposite of action
    if (action.type == 'add') {
      children.splice(childIndex, 1);
    } else if (action.type == 'delete') {
      children.splice(childIndex, 0, action.box);
    } else if (action.type == 'edit') {
      children[childIndex].content = action.lastContent;
    }
    // fix index
    for (let i = childIndex; i < children.length; i++) {
      children[i].index = i;
    }
    parent.children = [...children];
  }
  redoAction(action) {
    console.log('redo', this.index, this.data);
    let parent = boxFromPath(action.path, 1);
    let childIndex = action.path[action.path.length - 1];
    let children = [...parent.children];
    // do opposite of action
    if (action.type == 'add') {
      children.splice(
        childIndex,
        0,
        newBox(childIndex, parent.level + 1, false)
      );
    } else if (action.type == 'delete') {
      children.splice(childIndex, 1);
    } else if (action.type == 'edit') {
      children[childIndex].content = action.nextContent;
    }
    // fix index
    for (let i = childIndex; i < children.length; i++) {
      children[i].index = i;
    }
    parent.children = [...children];
  }
  focus(path) {
    let box = boxFromPath(path);
    box.focus = true;
  }
  undo() {
    // resolve any pending changes if not in history
    this.resolveAllPending();
    if (this.index > -1) {
      let action = this.lastAction();
      this.undoAction(action);
      this.focus(action.lastFocus);
      flows.set($flows);
      this.index -= 1;
    }
  }
  redo() {
    // resolve any pending changes if not in history
    this.resolveAllPending();
    if (this.index < this.data.length - 1) {
      this.index += 1;
      let action = this.lastAction();
      this.redoAction(action);
      this.focus(action.nextFocus);
      flows.set($flows);
    }
  }
}
