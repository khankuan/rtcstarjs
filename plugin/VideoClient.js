var VideoWidgetClient = function(rtcStarClient){
	
	var client;
	var onNewPeerCallHandler = new Array();
	var onStartHandler = new Array();
	var peerList = new Array();

	var userLocalStream; 

	setUp(rtcStarClient);
	
	function setUp(rtcStarClient) {

		client = rtcStarClient;

		client.onClientEvent('PeerList', callAllExistingUser);
		//client.onClientEvent('Close', disableVideo);
		//client.onClientEvent('Error', disableVideo);
		client.onClientEvent('Call',onNewCallFromPeer);

	}

	this.onCall = function(handler){
		onNewPeerCallHandler.push(handler);
	}


	this.onStart = function (handler){
		onStartHandler.push(handler);		
	}

	function onNewCallFromPeer(callConn){	

		callConn.answer(userLocalStream);
		callConn.on('stream',function(stream){
			for(var i in onNewPeerCallHandler)
				onNewPeerCallHandler[i](stream);	
		})

	}


	function callAllExistingUser(message){

		//Adding all the peerId into an array 
		$.each(message.data,function(i,peerId){
			if(client.getClientPeerId() != peerId){
				peerList.push(peerId);
			}
		})
		
		navigator.getMedia = navigator.getUserMedia || 
								 navigator.webkitGetUserMedia || 
								 navigator.mozGetUserMedia || 
								 navigator.msGetUserMedia;

		navigator.getMedia (
			{
				video: true, 
				audio: true
			}, function(stream) {
				for(var i in onStartHandler)
					onStartHandler[i](stream);

				callPeerWithStream(stream);
				userLocalStream = stream;
			}, function(err) {
				console.log('Failed to get local stream' ,err);
		});

	}

	function callPeerWithStream(userLocalStream){
		//Calling all the peer 
		$.each(peerList,function(i,peerIdToCall){

			var call = client.call(peerIdToCall,userLocalStream);
			
			call.on('stream', function(stream) {
				console.log('remote stream');
				console.log(stream);

				for(var i in onNewPeerCallHandler)
					onNewPeerCallHandler[i](stream);
			});

		})	
	}


}