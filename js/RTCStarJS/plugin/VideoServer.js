var VideoWidgetServer = function(rtcStarServer){
	
	var server;
	var videoConnectHandler = new Array();
	var onCallHandler = new Array();

	setUp(rtcStarServer);
	
	function setUp(rtcStarServer) {
		server = rtcStarServer;
		//server.onClientEvent('PeerList', videoConnectHandler);
	}

	this.onCall = function (handler) {
		onCallHandler.push(handler);
	}

	function videoHandler(message){
		for(var i in onCallHandler)
			onCallHandler[i](message);
	}
}