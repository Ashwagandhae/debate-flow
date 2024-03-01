// host: creatingHostKey -> createdHostKey + awaitingGuestKey -> receivedGuestKey -> connected

import { writable, type Writable } from 'svelte/store';
import type { GuestMessage, HostMessage } from './node';

// guest: awaitingHostKey -> receivedHostKey + creatingGuestKey -> createdGuestKey -> connected
const MESSAGE_CHANNEL_NAME = 'messageChannel';

export class Channel<SendMessage, RecieveMessage> {
	#channel: RTCDataChannel;
	constructor(channel: RTCDataChannel) {
		this.#channel = channel;
	}
	send(message: SendMessage) {
		const payload = JSON.stringify(message);
		// setTimeout(() => {
		this.#channel.send(payload);
		// }, 5000);
	}
	onOpen(fn: () => void) {
		this.#channel.addEventListener('open', fn);
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

type Empty = {
	tag: 'empty';
};
type HostCreatingKey = {
	tag: 'hostCreatingKey';
	pc: RTCPeerConnection;
	channel: Channel<HostMessage, GuestMessage>;
};
type HostAwaitingGuestKey = {
	tag: 'hostAwaitingGuestKey';
	pc: RTCPeerConnection;
	localOffer: string;
	channel: Channel<HostMessage, GuestMessage>;
};
type HostConnected = {
	tag: 'hostConnected';
	pc: RTCPeerConnection;
	channel: Channel<HostMessage, GuestMessage>;
};
type Host = HostCreatingKey | HostAwaitingGuestKey | HostConnected;

type GuestAwaitingHostKey = {
	tag: 'guestAwaitingHostKey';
	pc: RTCPeerConnection;
};

type GuestCreatingKey = {
	tag: 'guestCreatingKey';
	pc: RTCPeerConnection;
};

type GuestAwaitingChannel = {
	tag: 'guestAwaitingChannel';
	pc: RTCPeerConnection;
	localOffer: string;
};

type GuestConnected = {
	tag: 'guestConnected';
	pc: RTCPeerConnection;
	channel: Channel<GuestMessage, HostMessage>;
};

type Guest = GuestAwaitingHostKey | GuestCreatingKey | GuestAwaitingChannel | GuestConnected;

export type Connection = Empty | Host | Guest;

export const connection: Writable<Connection> = writable({
	tag: 'empty'
});

export function setAddHostChannelHandler(
	handler: (channel: Channel<HostMessage, GuestMessage>) => void
) {
	addHostChannelHandler = handler;
}

export function setAddGuestChannelHandler(
	handler: (channel: Channel<GuestMessage, HostMessage>) => void
) {
	addGuestChannelHandler = handler;
}

let addHostChannelHandler: (channel: Channel<HostMessage, GuestMessage>) => void;
let addGuestChannelHandler: (channel: Channel<GuestMessage, HostMessage>) => void;

export function initHostConnection() {
	const conf = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
	const pc = new RTCPeerConnection(conf);
	const channel = new Channel<HostMessage, GuestMessage>(
		pc.createDataChannel(MESSAGE_CHANNEL_NAME)
	);
	addHostChannelHandler(channel);
	connection.set({ tag: 'hostCreatingKey', pc, channel });

	pc.addEventListener('icecandidate', function (e) {
		const cand = e.candidate;
		if (!cand) {
			connection.update(function (connection) {
				if (connection.tag != 'hostCreatingKey') return connection;
				return {
					tag: 'hostAwaitingGuestKey',
					pc: connection.pc,
					channel: connection.channel,
					localOffer: JSON.stringify(pc.localDescription)
				};
			});
		}
	});
	pc.createOffer()
		.then((des) => {
			pc.setLocalDescription(des)
				.then(() => {
					setTimeout(function () {
						if (pc.iceGatheringState != 'complete') {
							connection.update(function (connection) {
								if (connection.tag != 'hostCreatingKey') return connection;
								return {
									tag: 'hostAwaitingGuestKey',
									pc: connection.pc,
									channel: connection.channel,
									localOffer: JSON.stringify(pc.localDescription)
								};
							});
						}
					}, 2000);
				})
				.catch(errHandler);
		})
		.catch(errHandler);
}

export function initGuestConnection() {
	// set guest to awaiting host key
	const conf = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
	const pc = new RTCPeerConnection(conf);
	connection.set({ tag: 'guestAwaitingHostKey', pc });
}

export function giveHostGuestKey(remoteOffer: string) {
	connection.update(function (oldConnection) {
		if (oldConnection.tag != 'hostAwaitingGuestKey') return oldConnection;
		const _remoteOffer = new RTCSessionDescription(JSON.parse(remoteOffer));
		oldConnection.pc
			.setRemoteDescription(_remoteOffer)
			.then(function () {
				connection.update(function (oldConnection) {
					if (oldConnection.tag != 'hostAwaitingGuestKey') return oldConnection;
					return {
						tag: 'hostConnected',
						pc: oldConnection.pc,
						channel: oldConnection.channel
					};
				});
			})
			.catch(errHandler);
		return oldConnection;
	});
}

export function giveGuestHostKey(remoteOffer: string) {
	connection.update(function (oldConnection) {
		if (oldConnection.tag != 'guestAwaitingHostKey') return oldConnection;
		// when offer is created, start waiting for channel
		oldConnection.pc.addEventListener('icecandidate', function (e) {
			const cand = e.candidate;
			if (!cand) {
				connection.update(function (connection) {
					if (connection.tag != 'guestCreatingKey') return connection;
					return {
						tag: 'guestAwaitingChannel',
						pc: connection.pc,
						localOffer: JSON.stringify(oldConnection.pc.localDescription)
					};
				});
			}
		});
		// create offer
		const _remoteOffer = new RTCSessionDescription(JSON.parse(remoteOffer));
		oldConnection.pc
			.setRemoteDescription(_remoteOffer)
			.then(function () {
				oldConnection.pc
					.createAnswer()
					.then(function (description) {
						oldConnection.pc.setLocalDescription(description).then().catch(errHandler);
					})
					.catch(errHandler);
			})
			.catch(errHandler);
		// when channel is created, update connection
		oldConnection.pc.ondatachannel = function (e) {
			if (e.channel.label != MESSAGE_CHANNEL_NAME) return;
			connection.update(function (connection) {
				if (connection.tag != 'guestAwaitingChannel') return connection;
				const channel = new Channel<GuestMessage, HostMessage>(e.channel);
				addGuestChannelHandler(channel);
				return {
					tag: 'guestConnected',
					pc: connection.pc,
					channel
				};
			});
		};
		return {
			tag: 'guestCreatingKey',
			pc: oldConnection.pc
		};
	});
}

export function disconnect() {
	connection.update(function (oldConnection) {
		if (oldConnection.tag == 'empty') return oldConnection;
		oldConnection.pc.close();
		return {
			tag: 'empty'
		};
	});
}

function errHandler(err: Error) {
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

export function createJoinLink(hostKey: string): string {
	return createLinkWithParam('join', hostKey);
}

export function createConfirmLink(guestKey: string): string {
	return createLinkWithParam('confirm', guestKey);
}

export function parseJoinLink(): string | null {
	return readLinkParam('join');
}

export function parseConfirmLink(): string | null {
	return readLinkParam('confirm');
}