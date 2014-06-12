function ChatClient(rtcStarClient){
	
	var _this = this;
	this.initHandler;
	this.newChatHandler;
	this.disableChatHandler;
	
	this.sendChat = function(text){
		rtcStarClient.request("chat.requestNewChat", text);
	}

	rtcStarClient.on('chat.init', function(message){
		if (_this.initHandler)
			_this.initHandler(message);
	});
	rtcStarClient.on('chat.newChat', function(message){
		if (_this.newChatHandler)
			_this.newChatHandler(message);
	});
	rtcStarClient.on('$close', function(message){
		if (_this.disableChatHandler)
			_this.disableChatHandler(message);
	});
	rtcStarClient.on('$error', function(message){
		if (_this.disableChatHandler)
			_this.disableChatHandler(message);
	});
}