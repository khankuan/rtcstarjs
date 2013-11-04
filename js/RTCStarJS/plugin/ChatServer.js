var ChatWidgetServer = function(rtcStarServer){

	var history;
	rtcStarServer.key = 'fxv643daihuuwhfr';	//	Pls don't abuse this :(
	rtcStarServer.onServerEvent('Open', init);
	rtcStarServer.onServerEvent('ClientEnter', initClient);
	rtcStarServer.onRequest('Chat', newChat);	//	Listen to Chat requests
	
	//	When server starts
	function init(serverId){
		history = [];
	}

	//	When a new user enters, we send the chat history
	function initClient(peerId){
		var message = new Object();
		message.type = 'Chat';
		message.subType = 'Init';
		message.data = history;
		rtcStarServer.send(peerId, message);
	}
	
	//	When receiving a new chat, we store the message and broadcast it
	function newChat(message){
		//storing history of chat 
		history.push(message);
		rtcStarServer.broadcast(message);
	}
}