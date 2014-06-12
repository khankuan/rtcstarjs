var ChatServer = function(rtcStarServer){

	var history;
	
	function init(){
		history = [];
	}
	
	function initClient(message){
		var id = message.id;

		if (history)
			rtcStarServer.send(id, "chat.init", history);
	}
	
	function newChat(message){
		var chat = {clientId: message.clientId, content: message.data, timestamp: new Date()};
		history.push(chat);
		rtcStarServer.broadcast("chat.newChat", chat);
	}

	rtcStarServer.on('$open', init);
	rtcStarServer.on('$enter', initClient);
	rtcStarServer.on('chat.requestNewChat', newChat);
}