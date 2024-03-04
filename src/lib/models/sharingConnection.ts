// host: creatingHostKey -> createdHostKey + awaitingGuestKey -> receivedGuestKey -> connected

import { writable, type Writable } from 'svelte/store';
import type { GuestMessage, HostMessage } from './node';
import { openPopup } from './popup';
import Message from '$lib/components/Message.svelte';

// guest: awaitingHostKey -> receivedHostKey + creatingGuestKey -> createdGuestKey -> connected
const MESSAGE_CHANNEL_NAME = 'messageChannel';

export class Channel<SendMessage, RecieveMessage> {
	#channel: RTCDataChannel;
	queuedMessages: SendMessage[];
	constructor(channel: RTCDataChannel) {
		this.#channel = channel;
		this.queuedMessages = [];
	}
	send(message: SendMessage) {
		const payload = JSON.stringify(message);
		if (this.#channel.readyState == 'open') {
			const channel = this.#channel;
			channel.send(payload);
		} else {
			this.queuedMessages.push(message);
		}
	}
	onOpen(fn: () => void) {
		this.#channel.addEventListener('open', fn);
		for (const message of this.queuedMessages) {
			this.send(message);
		}
		this.queuedMessages = [];
	}
	onClose(fn: () => void) {
		this.#channel.addEventListener('close', fn);
	}
	onMessage(fn: (event: RecieveMessage) => void) {
		this.#channel.addEventListener('message', function (event: MessageEvent<string>) {
			fn(JSON.parse(event.data));
		});
	}
}

export type GuestKey = {
	localOffer: string;
	broadcastId: string;
};

export type HostKey = {
	localOffer: string;
	broadcastId: string;
};

export type GuestBroadcast = {
	tag: 'guestKey';
	key: GuestKey;
};

export type HostBroadcast =
	| {
			tag: 'guestKeyRecieved';
			broadcastId: string;
	  }
	| {
			tag: 'guestKeyMismatch';
			broadcastId: string;
	  };

export type Broadcast = GuestBroadcast | HostBroadcast;

export type HostCreatingKey = {
	tag: 'hostCreatingKey';
	pc: RTCPeerConnection;
	channel: Channel<HostMessage, GuestMessage>;
};
export type HostAwaitingGuestKey = {
	tag: 'hostAwaitingGuestKey';
	pc: RTCPeerConnection;
	key: HostKey;
	channel: Channel<HostMessage, GuestMessage>;
	broadcastChannel: BroadcastChannel;
};
export type HostConnected = {
	tag: 'hostConnected';
	pc: RTCPeerConnection;
	channel: Channel<HostMessage, GuestMessage>;
	name: string;
};
export type Host = HostCreatingKey | HostAwaitingGuestKey | HostConnected;

export type GuestAwaitingHostKey = {
	tag: 'guestAwaitingHostKey';
	pc: RTCPeerConnection;
};

export type GuestCreatingKey = {
	tag: 'guestCreatingKey';
	pc: RTCPeerConnection;
};

export type GuestAwaitingChannel = {
	tag: 'guestAwaitingChannel';
	pc: RTCPeerConnection;
	key: GuestKey;
};

export type GuestConnected = {
	tag: 'guestConnected';
	pc: RTCPeerConnection;
	channel: Channel<GuestMessage, HostMessage>;
	name: string | null;
};

export type Guest = GuestAwaitingHostKey | GuestCreatingKey | GuestAwaitingChannel | GuestConnected;

export type ConnectionId = string & { readonly NodeId: unique symbol };
function newConnectionId(): ConnectionId {
	return crypto.randomUUID() as ConnectionId;
}

export type ConnectionHolder<Connection> = {
	[key: ConnectionId]: Connection;
};
export type Connections =
	| {
			tag: 'empty';
	  }
	| {
			tag: 'host';
			building: ConnectionId | null;
			holder: ConnectionHolder<Host>;
	  }
	| {
			tag: 'guest';
			building: boolean;
			connection: Guest;
	  };

export const connections: Writable<Connections> = writable({
	tag: 'empty'
});

function generateGuestName(holder: ConnectionHolder<Host>) {
	const names = new Set<string>();
	for (const id of Object.keys(holder)) {
		const connection = holder[<ConnectionId>id];
		if (connection.tag == 'hostConnected' && connection.name) {
			names.add(connection.name);
		}
	}
	let i = 1;
	let name = 'guest ' + i;
	while (names.has(name)) {
		name = 'guest ' + i;
		i++;
	}
	return name;
}

export const pendingConnection: Writable<ConnectionId | null> = writable(null);

export function setAddHostChannelHandler(
	handler: (channel: Channel<HostMessage, GuestMessage>, id: ConnectionId) => void
) {
	addHostChannelHandler = handler;
}

export function setAddGuestChannelHandler(
	handler: (channel: Channel<GuestMessage, HostMessage>) => void
) {
	addGuestChannelHandler = handler;
}

let addHostChannelHandler: (channel: Channel<HostMessage, GuestMessage>, id: ConnectionId) => void;
let addGuestChannelHandler: (channel: Channel<GuestMessage, HostMessage>) => void;

export function initHost() {
	connections.update(function (oldConnections) {
		if (oldConnections.tag != 'empty') return oldConnections;
		return {
			tag: 'host',
			building: null,
			holder: {}
		};
	});
}
export function addHostConnection(): ConnectionId {
	const id = newConnectionId();
	connections.update(function (oldConnections) {
		if (oldConnections.tag != 'host') return oldConnections;

		const conf = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
		const pc = new RTCPeerConnection(conf);
		const channel = new Channel<HostMessage, GuestMessage>(
			pc.createDataChannel(MESSAGE_CHANNEL_NAME)
		);
		addHostChannelHandler(channel, id);
		oldConnections.holder[id] = { tag: 'hostCreatingKey', pc, channel };

		const broadcastId = crypto.randomUUID();

		const broadcastChannel = new BroadcastChannel('guestKeySend');
		broadcastChannel.addEventListener('message', (event) => {
			const message: Broadcast = event.data;

			connections.update(function (connections) {
				if (connections.tag != 'host') return connections;
				const connection = connections.holder[id];
				if (connection.tag == 'hostAwaitingGuestKey' && message.tag == 'guestKey') {
					let response: Broadcast;
					if (connection.key.broadcastId == message.key.broadcastId) {
						giveHostGuestKey(message.key);
						response = {
							tag: 'guestKeyRecieved',
							broadcastId: message.key.broadcastId
						};
					} else {
						response = {
							tag: 'guestKeyMismatch',
							broadcastId: message.key.broadcastId
						};
					}
					broadcastChannel.postMessage(response);
				}
				return connections;
			});
		});

		pc.addEventListener('icecandidate', function (e) {
			const cand = e.candidate;
			if (!cand) {
				connections.update(function (connections) {
					if (connections.tag != 'host') return connections;
					const connection = connections.holder[id];
					if (connection.tag != 'hostCreatingKey') return connections;
					connections.holder[id] = {
						tag: 'hostAwaitingGuestKey',
						pc: connection.pc,
						channel: connection.channel,
						key: {
							localOffer: JSON.stringify(pc.localDescription),
							broadcastId
						},
						broadcastChannel
					};
					return connections;
				});
			}
		});
		pc.createOffer()
			.then((des) => {
				pc.setLocalDescription(des)
					.then(() => {
						setTimeout(function () {
							if (pc.iceGatheringState != 'complete') {
								connections.update(function (connections) {
									if (connections.tag != 'host') return connections;
									const connection = connections.holder[id];
									if (connection.tag != 'hostCreatingKey') return connections;
									connections.holder[id] = {
										tag: 'hostAwaitingGuestKey',
										pc: connection.pc,
										channel: connection.channel,
										key: {
											localOffer: JSON.stringify(pc.localDescription),
											broadcastId
										},
										broadcastChannel
									};
									return connections;
								});
							}
						}, 2000);
					})
					.catch(errHandler);
			})
			.catch(errHandler);
		return { ...oldConnections, building: id };
	});
	return id;
}

export function initGuestConnection() {
	// set guest to awaiting host key
	const conf = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
	const pc = new RTCPeerConnection(conf);
	const connection: GuestAwaitingHostKey = {
		tag: 'guestAwaitingHostKey',
		pc
	};
	connections.set({
		tag: 'guest',
		connection,
		building: true
	});
}

export function giveHostGuestKey(key: GuestKey) {
	connections.update(function (oldConnections) {
		if (oldConnections.tag != 'host') return oldConnections;
		const id = oldConnections.building;
		if (id == null) return oldConnections;
		const connection = oldConnections.holder[id];
		if (connection.tag != 'hostAwaitingGuestKey') return oldConnections;
		if (connection.key.broadcastId != key.broadcastId) return oldConnections;
		const _remoteOffer = new RTCSessionDescription(JSON.parse(key.localOffer));
		connection.pc
			.setRemoteDescription(_remoteOffer)
			.then(function () {
				connections.update(function (oldConnections) {
					if (oldConnections.tag != 'host') return oldConnections;
					const connection = oldConnections.holder[id];
					if (connection.tag != 'hostAwaitingGuestKey') return oldConnections;
					connection.broadcastChannel.close();
					// make sure the broadcast id matches
					const name = generateGuestName(oldConnections.holder);
					oldConnections.holder[id] = {
						tag: 'hostConnected',
						pc: connection.pc,
						channel: connection.channel,
						name
					};

					connection.channel.onOpen(function () {
						connection.channel.send({
							tag: 'name',
							name
						});
					});

					addConnectionStateUpdater(connection.pc, name, function () {
						connections.update(function (connections) {
							if (connections.tag != 'host') return connections;
							delete connections.holder[id];
							return connections;
						});
					});

					return { ...oldConnections, building: null };
				});
			})
			.catch(errHandler);
		return oldConnections;
	});
}

export function addConnectionStateUpdater(
	pc: RTCPeerConnection,
	name: string,
	cleanup: (reason: 'failed' | 'closed') => void
) {
	pc.addEventListener('connectionstatechange', function () {
		// inform subscribers of the connection state
		connections.update((connections) => connections);
		if (pc.connectionState == 'failed' || pc.connectionState == 'closed') {
			openPopup(Message, 'Disconnected', {
				message: `Disconnected from ${name}`
			});
			cleanup(pc.connectionState);
		}
	});
}

export function giveGuestHostKey(key: HostKey) {
	connections.update(function (oldConnections) {
		if (oldConnections.tag != 'guest') return oldConnections;
		const connection = oldConnections.connection;
		if (connection.tag != 'guestAwaitingHostKey') return oldConnections;
		// when offer is created, start waiting for channel
		connection.pc.addEventListener('icecandidate', function (e) {
			const cand = e.candidate;
			if (!cand) {
				connections.update(function (connections) {
					if (connections.tag != 'guest') return connections;
					const connection = connections.connection;
					if (connection.tag != 'guestCreatingKey') return connections;
					connections.connection = {
						tag: 'guestAwaitingChannel',
						pc: connection.pc,
						key: {
							localOffer: JSON.stringify(connection.pc.localDescription),
							broadcastId: key.broadcastId
						}
					};
					return connections;
				});
			}
		});
		// create offer
		const _remoteOffer = new RTCSessionDescription(JSON.parse(key.localOffer));
		connection.pc
			.setRemoteDescription(_remoteOffer)
			.then(function () {
				connection.pc
					.createAnswer()
					.then(function (description) {
						connection.pc.setLocalDescription(description).then().catch(errHandler);
					})
					.catch(errHandler);
			})
			.catch(errHandler);
		// when channel is created, update connection
		connection.pc.ondatachannel = function (e) {
			if (e.channel.label != MESSAGE_CHANNEL_NAME) return;
			connections.update(function (oldConnections) {
				if (oldConnections.tag != 'guest') return oldConnections;
				const connection = oldConnections.connection;
				if (connection.tag != 'guestAwaitingChannel') return oldConnections;
				const channel = new Channel<GuestMessage, HostMessage>(e.channel);
				addGuestChannelHandler(channel);
				oldConnections.connection = {
					tag: 'guestConnected',
					pc: connection.pc,
					channel,
					name: null
				};
				addConnectionStateUpdater(connection.pc, 'host', function () {
					connections.update(function (connections) {
						if (connections.tag != 'guest') return connections;
						return {
							tag: 'empty'
						};
					});
				});
				return { ...oldConnections, building: false };
			});
		};
		oldConnections.connection = {
			tag: 'guestCreatingKey',
			pc: connection.pc
		};
		return oldConnections;
	});
}

export function disconnect() {
	connections.update(function (connections) {
		if (connections.tag == 'empty') return connections;
		switch (connections.tag) {
			case 'host':
				for (const id of <ConnectionId[]>Object.keys(connections.holder)) {
					const connection = connections.holder[id];
					connection.pc.close();
				}
				break;
			case 'guest':
				connections.connection.pc.close();
				break;
		}
		return {
			tag: 'empty'
		};
	});
}

export function cancelBuilding() {
	connections.update(function (connections) {
		if (connections.tag == 'host' && connections.building != null) {
			connections.holder[connections.building].pc.close();
			delete connections.holder[connections.building];
		} else if (connections.tag == 'guest' && connections.building) {
			connections.connection.pc.close();
			connections = {
				tag: 'empty'
			};
		}
		return connections;
	});
}

function errHandler(err: Message) {
	console.log(err);
}

function createLinkWithParam(param: string, value: string): string {
	const currentUrl = new URL(location.pathname, location.href);
	currentUrl.searchParams.set(param, value);
	return currentUrl.href;
}

function readLinkParam(param: string): string | null {
	const url = new URL(location.href);
	const value = url.searchParams.get(param);
	if (value) {
		return value;
	}
	return null;
}

export function createJoinLink(hostKey: HostKey): string {
	return createLinkWithParam('join', JSON.stringify(hostKey));
}

export function createConfirmLink(guestKey: GuestKey): string {
	return createLinkWithParam('confirm', JSON.stringify(guestKey));
}

export function parseJoinLink(): HostKey | null {
	const raw = readLinkParam('join');
	if (raw == null) return null;
	return JSON.parse(raw);
}

export function parseConfirmLink(): GuestKey | null {
	const raw = readLinkParam('confirm');
	if (raw == null) return null;
	return JSON.parse(raw);
}
