var ChatWidgetClient = function(rtcStarClient){
	
	var client;
	var onMessageHandler = new Array();

	setUp(rtcStarClient);
	
	function setUp(rtcStarClient) {

		client = rtcStarClient;
		client.onMessage('Chat', chatHandler);
		client.onClientEvent('Close', disableChat);
		client.onClientEvent('Error', disableChat);

	}

	this.onMessage = function(handler){
		onMessageHandler.push(handler);
	}
	
	//	Send button on html
	this.sendChat = function(text){

		var message = new Object();
		message.type = 'Chat';
		message.text = text;
		message.subType = 'NewChat';

		client.request(message);
	
	}
	
	function chatHandler(message){
		console.log('recieved here!');
		//Don't want to recieve my own message
		if(message.peerId != client.getClientPeerId()){
			for(var i in onMessageHandler)
				onMessageHandler[i](message);
		}
	}
	
	function disableChat(){
		//	Disable send button
		//	Grey out text field
		//	Or call some method to do that
	}
}