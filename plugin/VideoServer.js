var VideoWidgetServer = function(rtcStarServer){
	
	var server;
	var videoConnectHandler = new Array();
	var onCallHandler = new Array();

	setUp(rtcStarServer);
	
	function setUp(rtcStarServer) {

		server = rtcStarServer;
		//server.onClientEvent('PeerList', videoConnectHandler);
		server.onServerEvent('Close', disableVideo);
		server.onServerEvent('Error', disableVideo);

	}

	this.onCall = function (handler) {
		onCallHandler.push(handler);
	}


	function videoHandler(message){
		for(var i in onCallHandler)
			onCallHandler[i](message);
	}
	
	function disableVideo(){
		//	Disable send button
		//	Grey out text field
		//	Or call some method to do that
	}
}