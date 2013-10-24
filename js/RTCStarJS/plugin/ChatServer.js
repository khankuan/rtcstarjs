var ChatWidgetServer = function(rtcStarServer){

	//originally was var history[];
	var history;
	var server;

	setUp(rtcStarServer);

	function setUp(rtcStarServer){

		server = rtcStarServer;
		server.onServerEvent('Open', init);
		server.onServerEvent('ClientEnter', initClient);
		server.onRequest('Chat', newChat);
	}
	
	function init(serverId){
		history = [];
	}
	
	function initClient(peerId){

		if (history.length !=0){
			var message = new Object();
			message.type = 'Chat';
			message.subType = 'Init';
			message.data = history;
			server.send(peerId, JSON.stringify(message));
		}
	}
	
	function newChat(message){
		//storing history of chat 
		console.log('here!!');
		history.push(message);
		server.broadcast(message);

	}


}