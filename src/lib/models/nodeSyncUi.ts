import type { Nodes } from './node';
import { _nodesMut } from './store';

export function syncUi(nodes: Nodes) {
	_nodesMut.set(nodes);
}
