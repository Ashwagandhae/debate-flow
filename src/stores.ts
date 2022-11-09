import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Box, Flow } from './types';
import { settings } from './settings';

export const activeMouse = writable(true);
export let flows: Writable<Flow[]> = writable([]);
export let selected = writable(0);
export let changesSaved = writable(false);
let debateStyles = {
  policy: {
    aff: {
      columns: ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
      invert: false,
    },
    neg: {
      columns: ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
      invert: true,
    },
  },
  publicForum: {
    aff: {
      columns: ['1AC', '1NC', '2AC', '2NC', 'AS', 'NS', 'AFF', 'NFF'],
      invert: false,
    },
    neg: {
      columns: ['1NC', '1AC', '2NC', '2AC', 'AS', 'NS', 'AFF', 'NFF'],
      invert: true,
    },
  },
  lincolnDouglas: {
    aff: {
      columns: ['AC', 'NC', '1AR', '1NR', '2AR'],
      invert: false,
    },
    neg: {
      columns: ['NC', '1AR', '1NR', '2AR'],
      invert: true,
    },
  },
};
let debateStyleIndex = ['policy', 'publicForum', 'lincolnDouglas'];

let $flows: Flow[];
flows.subscribe((value) => {
  $flows = value;
});

export function newBox(index: number, level: number, focus: boolean) {
  return <Box>{
    content: '',
    children: [],
    index: index,
    level: level,
    focus: focus,
  };
}
export function newFlow(index: number, type: string) {
  let currentDebateStyle =
    debateStyles[debateStyleIndex[settings.data.debateStyle.value]];
  return <Flow>{
    content: '',
    level: 0,
    columns: currentDebateStyle[type].columns,
    invert: currentDebateStyle[type].invert,
    focus: true,
    index: index,
    lastFocus: [index],
    children: [newBox(0, 1, false)],
    history: new History(),
  };
}

export function boxFromPath(path: number[], scope: number = 0): Flow | Box {
  let ret: Flow | Box = $flows[path[0]];
  for (let i = 1; i < path.length - scope; i++) {
    ret = ret?.children[path[i]];
    if (!ret) {
      throw new Error('Invalid path');
    }
  }

  return ret;
}
type Action = {
  type: string;
  path: number[];
  lastFocus: number[] | null;
  nextFocus: number[] | null;
  pending: boolean;
  other: any;
};
export class History {
  index: number;
  data: Action[];
  lastFocus: number[] | null;
  constructor() {
    this.index = -1;
    this.data = [];
    this.lastFocus = null;
  }
  lastAction() {
    return this.data[this.index];
  }
  add(type: string, path: number[], other?: any) {
    changesSaved.set(false);
    this.resolveAllPending();
    if (this.lastFocus == null) return;
    let action: Action = {
      type: type,
      path: path,
      lastFocus: this.lastFocus == null ? null : [...this.lastFocus],
      nextFocus: null,
      other: other,
      pending: false,
    };

    this.data = this.data.slice(0, this.index + 1);
    this.data.push(action);
    this.index = this.data.length - 1;
  }
  addPending(type: string, path: number[], other?: any) {
    changesSaved.set(false);
    this.data = this.data.slice(0, this.index + 1);
    this.data.push({
      type: type,
      path: path,
      lastFocus: null,
      nextFocus: null,
      other: other,
      pending: true,
    });
    this.index = this.data.length - 1;
  }
  resolveAllPending() {
    let actionHappened: boolean = false;
    let tempData: (null | Action)[] = [...this.data];
    for (let i = 0; i < this.data.length; i++) {
      let pendingAction = this.data[i];
      if (pendingAction.pending) {
        let action: Action = {
          type: pendingAction.type,
          path: pendingAction.path,
          lastFocus: pendingAction.path,
          nextFocus: pendingAction.path,
          other: pendingAction.other,
          pending: false,
        };
        let shouldAdd = true;
        if (action.type == 'edit') {
          action.other.lastContent = pendingAction.other.lastContent;
          action.other.nextContent = pendingAction.other.getNextContent();
          if (action.other.lastContent == action.other.nextContent) {
            shouldAdd = false;
          }
          pendingAction.other.createEditBreak();
        }
        if (shouldAdd) {
          actionHappened = true;
          tempData[i] = action;
        } else {
          tempData[i] = null;
          if (this.index >= i) {
            this.index -= 1;
          }
        }
      }
    }
    this.data = tempData.filter((el) => el != null) as Action[];
    if (actionHappened) {
      console.log('resolving all pending');
    }
  }
  addFocus(path: number[]) {
    this.lastFocus = path;
    if (this.lastAction()) {
      if (this.lastAction().nextFocus == undefined) {
        this.lastAction().nextFocus = path;
      }
    }
  }
  undoAction(action: Action) {
    console.log('undo', this.index, this.data);
    let parent: Flow | Box = boxFromPath(action.path, 1);
    let childIndex: number = action.path[action.path.length - 1];
    let children: Box[] = [...parent.children];
    // do opposite of action
    if (action.type == 'add') {
      children.splice(childIndex, 1);
    } else if (action.type == 'delete') {
      children.splice(childIndex, 0, action.other.box);
    } else if (action.type == 'edit') {
      children[childIndex].content = action.other.lastContent;
    }
    // fix index
    for (let i = childIndex; i < children.length; i++) {
      children[i].index = i;
    }
    parent.children = [...children];
  }
  redoAction(action: Action) {
    console.log('redo', this.index, this.data);
    let parent: Flow | Box = boxFromPath(action.path, 1);
    let childIndex: number = action.path[action.path.length - 1];
    let children: Box[] = [...parent.children];
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
      children[childIndex].content = action.other.nextContent;
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
