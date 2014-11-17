function MatrixMulClient(rtcStarClient){
	
	var _this = this;
	var data;
	var dataReceived = false;
	var workStarted = false;
	this.logHandler;

	rtcStarClient.on('matrixmul.data', function(message){
		if (dataReceived)
			return;

		data = message.data;
		_this.logHandler("Recieved Data");
		dataReceived = true;
		rtcStarClient.request("matrixmul.dataReceived");
	});

	rtcStarClient.on('matrixmul.start', function(message){
		if (!dataReceived || workStarted)
			return;

		workStarted = true;
		_this.logHandler("Started Task");

		setTimeout(function(){

			var startTime = new Date().getTime();
			var result = computeMatrix(data);
			var timeTaken = (new Date().getTime() - startTime)/1000;

			//	Completed
			var message = {
				result: result,
				rowStart: data.rowStart,
				rowEndExclusive: data.rowEndExclusive,
			};
			dataReceived = false;
			workStarted = false;
			_this.logHandler("Completed task of size " + (data.rowEndExclusive - data.rowStart) + ", took "+timeTaken + " seconds");
			rtcStarClient.request("matrixmul.taskCompleted", message);
		},0);
	});

	function ended(){
		_this.logHandler("Client disconnected");
	}

	rtcStarClient.on("$close", ended);
	rtcStarClient.on("$error", ended);
}