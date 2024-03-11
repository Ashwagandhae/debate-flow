import { isNodesWorthSaving, type Nodes } from './node';
import {
	applyActionBundleAndSyncUi,
	applyActionBundleBatchAndSyncUi,
	type ActionBundle
} from './nodeAction';
import { resolvePendingAction } from './nodePendingAction';
import { disconnect, type ConnectionId, type Connections } from './sharingConnection';
import { _nodesMut, connections, flowsChange, nodes } from './store';

let $connections: Connections;
connections.subscribe((connections) => {
	$connections = connections;
});

let $nodes: Nodes;
nodes.subscribe((nodes) => {
	$nodes = nodes;
});

export type ActionId = string & { readonly ActionId: unique symbol };

export type SendAction = {
	id: ActionId;
	actionBundle: ActionBundle;
};
export type HostMessage =
	| {
			tag: 'sync';
			nodes: Nodes;
			first: boolean;
	  }
	| {
			tag: 'action';
			action: SendAction;
	  }
	| {
			tag: 'actionRecieved';
			actionId: ActionId;
	  }
	| {
			tag: 'name';
			name: string;
	  };

export type GuestMessage =
	| {
			tag: 'requestSync';
	  }
	| {
			tag: 'action';
			action: SendAction;
	  };

function newActionId(): ActionId {
	return crypto.randomUUID() as ActionId;
}

const prediction: {
	actionsAwaitingConfirmation: { [key: ActionId]: ActionBundle };
	predictedInverse: ActionBundle[];
	confirmed: ActionBundle[];
} = {
	actionsAwaitingConfirmation: {},
	predictedInverse: [],
	confirmed: []
};

export function sendActionBundle(actionBundle: ActionBundle, inverseActionBundle: ActionBundle) {
	if ($connections.tag === 'host') {
		const id = newActionId();
		const message: HostMessage = {
			tag: 'action',
			action: {
				id,
				actionBundle
			}
		};
		for (const connectionId of Object.keys($connections.holder)) {
			$connections.holder[<ConnectionId>connectionId].channel.send(message);
		}
	} else if ($connections.tag === 'guest' && $connections.connection.tag === 'guestConnected') {
		const id = newActionId();
		$connections.connection.channel.send({
			tag: 'action',
			action: {
				id,
				actionBundle
			}
		});
		prediction.actionsAwaitingConfirmation[id] = actionBundle;
		prediction.predictedInverse.push(inverseActionBundle);
	}
}

interface Channel<SendMessage, RecieveMessage> {
	send(message: SendMessage): void;
	onOpen(fn: () => void): void;
	onClose(fn: () => void): void;
	onMessage(fn: (event: RecieveMessage) => void): void;
}

export function addHostChannelHandler(
	channel: Channel<HostMessage, GuestMessage>,
	id: ConnectionId
) {
	channel.onOpen(() => {
		channel.send({
			tag: 'sync',
			nodes: $nodes,
			first: true
		});
	});
	channel.onMessage((message) => {
		switch (message.tag) {
			case 'requestSync':
				channel.send({
					tag: 'sync',
					nodes: $nodes,
					first: false
				});
				break;
			case 'action': {
				if ($connections.tag != 'host') return;

				resolvePendingAction($nodes);
				applyActionBundleAndSyncUi(message.action.actionBundle);

				for (const otherId of Object.keys($connections.holder)) {
					if (id == otherId) continue;
					$connections.holder[<ConnectionId>otherId].channel.send(message);
				}

				channel.send({
					tag: 'actionRecieved',
					actionId: message.action.id
				});
				break;
			}
		}
	});
}
export function addGuestChannelHandler(channel: Channel<GuestMessage, HostMessage>) {
	channel.onMessage((message) => {
		switch (message.tag) {
			case 'sync':
				if (
					!message.first ||
					!isNodesWorthSaving($nodes) ||
					confirm("Are you sure you want to overwrite your work with the host's?")
				) {
					_nodesMut.set(message.nodes);
					flowsChange();
					connections.update(function (connections) {
						if (connections.tag == 'guest' && connections.connection.tag == 'guestConnected') {
							connections.connection.awaitingSync = false;
						}
						return connections;
					});
				} else {
					disconnect();
				}
				break;
			case 'name':
				connections.update(function (connections) {
					if (connections.tag == 'guest' && connections.connection.tag == 'guestConnected') {
						connections.connection.name = message.name;
					}
					return connections;
				});
				break;
			case 'action': {
				resolvePendingAction($nodes);
				prediction.confirmed.push(structuredClone(message.action.actionBundle));
				const actionInverse = applyActionBundleAndSyncUi(message.action.actionBundle);
				prediction.predictedInverse.push(actionInverse);
				break;
			}
			case 'actionRecieved': {
				prediction.confirmed.push(prediction.actionsAwaitingConfirmation[message.actionId]);
				delete prediction.actionsAwaitingConfirmation[message.actionId];
				// check if it's possible that all awaiting actions have been confirmed
				if (Object.keys(prediction.actionsAwaitingConfirmation).length != 0) return;
				// if there are no actions awaiting confirmation, resolve all pending actions, which might create new actions awaiting confirmation
				resolvePendingAction($nodes);
				// check all awaiting actions have been confirmed
				if (Object.keys(prediction.actionsAwaitingConfirmation).length != 0) return;

				// undo all predicted actions and do all confirmed actions
				applyActionBundleBatchAndSyncUi(
					$nodes,
					prediction.predictedInverse.toReversed().concat(prediction.confirmed)
				);

				// reset prediction
				prediction.predictedInverse = [];
				prediction.confirmed = [];

				break;
			}
		}
	});
}
