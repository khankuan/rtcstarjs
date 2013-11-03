var ChatWidgetClient = function(rtcStarClient){

	var delegate;
	rtcStarClient.onClientEvent('Open', openHandler);
	rtcStarClient.onMessage('Chat', chatHandler);	//  Register listener to Chat

	//  To delegate task of updating the view
	this.setdelegate = function(d){
		delegate = d;
	}
	
	//	Send button on html
	this.sendchat = function(text){
		var message = new Object();
		message.type = 'Chat';
		message.text = text;
		message.subType = 'NewChat';

		rtcStarClient.request(message);
	}

	//  When client is started
	function openHandler(peerId){
		if (delegate != undefined)
			delegate.onOpen(peerId);
	}
	
	//  When received a chat message
	function chatHandler(message){
		if (delegate != undefined)
			delegate.onMessage(message);
	}
}