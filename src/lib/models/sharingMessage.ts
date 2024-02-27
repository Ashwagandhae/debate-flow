// export function hostHandleMessage(
// 	connection: Connection,
// 	channel: RTCDataChannel,
// 	message: GuestMessage
// ) {}
// export function handleMessage(channel: RTCDataChannel, message: Message) {
// 	switch (message.kind) {
// 		case 'sync':
// 			break;
// 		case 'action':
// 			connection.update((c) => {
// 				if (c.tag === 'hostConnected' || c.tag === 'guestConnected') {
// 					c.channel.send(JSON.stringify(message));
// 				}
// 				return c;
// 			});
// 			break;
// 	}
// }
