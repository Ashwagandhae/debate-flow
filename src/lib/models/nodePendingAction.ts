// pendingAction is an action that's waiting to be resolved, used for text editing to prevent sending many actions while user is typing
// when pendingAction resolves, it will doActionBundle, meaning it will add it to history and send it to other clients
// pendingAction resolves before:
// - another action is done

import type { Box, BoxId, Flow, FlowId, Nodes, RootId } from './node';
import { doActionBundle, type Action, type ActionBundle } from './nodeAction';
import { pendingAction } from './store';
import { history } from './history';

// - focusId changes
export type PendingAction = {
	action: (nodes: Nodes) => ActionBundle | Action<Flow | Box>;
	beforeFocusId: FlowId | BoxId | null;
	afterFocusId: FlowId | BoxId | null;
	ownerId: FlowId | RootId;
};

let $pendingAction: PendingAction | null;
pendingAction.subscribe((value) => {
	$pendingAction = value;
});
export function resolvePendingAction(nodes: Nodes) {
	if ($pendingAction == null) return;
	history.setNextBeforeFocus($pendingAction.beforeFocusId, $pendingAction.ownerId);
	const action = $pendingAction.action(nodes);
	doActionBundle(action, $pendingAction.ownerId);
	history.setPrevAfterFocus($pendingAction.afterFocusId, $pendingAction.ownerId);
	pendingAction.set(null);
}
