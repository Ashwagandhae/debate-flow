import type { Box, Flow } from './type';
import { flows } from './store';
import { settings } from './settings';
import { debateStyles, debateStyleMap } from './debateStyle';
import { History } from './history';

let $flows: Flow[];
flows.subscribe((value) => {
	$flows = value;
});

export function newBox(index: number, level: number, focus: boolean, placeholder?: string): Box {
	return <Box>{
		content: '',
		children: [],
		index: index,
		level: level,
		focus: focus,
		placeholder: placeholder
	};
}
export function newFlow(
	index: number,
	type: 'primary' | 'secondary',
	switchSpeakers = false
): Flow | null {
	const currentDebateStyle =
		debateStyles[debateStyleMap[settings.data.debateStyle.value as number]];
	// get new id
	let id = 0;
	for (let i = 0; i < $flows.length; i++) {
		if ($flows[i].id >= id) {
			id = $flows[i].id + 1;
		}
	}
	let children: Box[];
	const style = currentDebateStyle[type];
	if (style == null) return null;
	const starterBoxes = style.starterBoxes;
	if (starterBoxes != null) {
		children = starterBoxes.map((placeholder, index) => newBox(index, 1, false, placeholder));
	} else {
		children = [newBox(0, 1, false)];
	}
	let columns;
	if (style.columnsSwitch != null && switchSpeakers) {
		columns = style.columnsSwitch;
	} else {
		columns = style.columns;
	}
	const flow: Omit<Flow, 'history'> & { history: null | History } = {
		content: '',
		level: 0,
		columns,
		invert: style.invert,
		focus: true,
		index: index,
		lastFocus: [],
		children,
		id: id,
		history: null
	};
	flow.history = new History(flow as unknown as Flow);
	return flow as Flow;
}

interface BoxLike<Child> {
	children: Child[];
}

export function boxFromPath<Root extends BoxLike<Child>, Child extends BoxLike<Child>>(
	root: Root,
	path: number[],
	scope = 0
): Root | Child | null {
	if (path.length == 0 && scope >= 1) {
		// can't go up any further
		return null;
	}
	let ret: Root | Child = root;
	for (let i = 0; i < path.length - scope; i++) {
		ret = ret?.children[path[i]];
		if (ret == undefined) {
			return null;
		}
	}

	return ret;
}
