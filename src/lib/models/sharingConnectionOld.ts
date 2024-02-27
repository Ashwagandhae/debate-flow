import { writable, type Writable } from 'svelte/store';

const conf = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const pc = new RTCPeerConnection(conf);
let _chatChannel: RTCDataChannel;

export function sendMessage(message: string) {
	_chatChannel.send(message);
	return false;
}
pc.ondatachannel = function (e) {
	if (e.channel.label == 'chatChannel') {
		console.log('chatChannel Received -', e);
		_chatChannel = e.channel;
		chatChannel(e.channel);
	}
};

export const localOffer: Writable<string> = writable('');

pc.onicecandidate = function (e) {
	const cand = e.candidate;
	if (!cand) {
		console.log('iceGatheringState complete\n', pc.localDescription?.sdp);
		localOffer.set(JSON.stringify(pc.localDescription));
		console.log(localOffer);
	} else {
		console.log(cand.candidate);
	}
};
pc.oniceconnectionstatechange = function () {
	console.log('iceconnectionstatechange: ', pc.iceConnectionState);
};

const remote: {
	srcObject?: MediaStream;
} = {};

pc.ontrack = function (e) {
	console.log('remote ontrack', e.streams);
	remote.srcObject = e.streams[0];
};
pc.addEventListener('connection', function (e) {
	console.log('onconnection ', e);
});

function errHandler(err: any) {
	console.log(err);
}

export function remoteOfferGot(remoteOffer: string) {
	const _remoteOffer = new RTCSessionDescription(JSON.parse(remoteOffer));
	console.log('remoteOffer \n', _remoteOffer);
	pc.setRemoteDescription(_remoteOffer)
		.then(function () {
			console.log('setRemoteDescription ok');
			if (_remoteOffer.type == 'offer') {
				pc.createAnswer()
					.then(function (description) {
						console.log('createAnswer 200 ok \n', description);
						pc.setLocalDescription(description).then().catch(errHandler);
					})
					.catch(errHandler);
			}
		})
		.catch(errHandler);
}
export function localOfferSet() {
	_chatChannel = pc.createDataChannel('chatChannel');
	// _fileChannel.binaryType = 'arraybuffer';
	chatChannel(_chatChannel);
	pc.createOffer()
		.then((des) => {
			console.log('createOffer ok ');
			pc.setLocalDescription(des)
				.then(() => {
					setTimeout(function () {
						if (pc.iceGatheringState == 'complete') {
							return;
						} else {
							console.log('after GetherTimeout');
							localOffer.set(JSON.stringify(pc.localDescription));
							console.log(localOffer);
						}
					}, 2000);
					console.log('setLocalDescription ok');
				})
				.catch(errHandler);
			// For chat
		})
		.catch(errHandler);
}

function chatChannel(e: RTCDataChannel) {
	_chatChannel.onopen = function (e) {
		console.log('chat channel is open', e);
	};
	_chatChannel.onmessage = function (e) {
		console.log('chat channel message', e.data);
	};
	_chatChannel.onclose = function () {
		console.log('chat channel closed');
	};
}

// function Stats() {
// 	pc.getStats(null, function (stats) {
// 		for (let key in stats) {
// 			let res = stats[key];
// 			console.log(res.type, res.googActiveConnection);
// 			if (res.type === 'googCandidatePair' && res.googActiveConnection === 'true') {
// 				// calculate current bitrate
// 				let bytesNow = res.bytesReceived;
// 				console.log('bit rate', bytesNow - bytesPrev);
// 				bytesPrev = bytesNow;
// 			}
// 		}
// 	});
// }

/* Summary
    //setup your video
    pc = new RTCPeerConnection
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    pc.addStream(stream)

    //prepare your sdp1
    pc.createOffer() - des
    pc.setLocalDescription(des)
    pc.onicecandidate
    pc.localDescription
    
    //create sdp from sdp1
    _remoteOffer = new RTCSessionDescription sdp
    pc.setRemoteDescription(_remoteOffer)
    _remoteOffer.type == "offer" && pc.createAnswer() - desc
    pc.setLocalDescription(description)
    pc.onaddstream
*/
