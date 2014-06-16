var MatrixMulServer = function(rtcStarServer, size){

	var _this = this;
	var clients = {};
	var matrixA;
	var matrixB;
	var result;
	var resultSize;

	var distributedData = false;
	var startedTask = false;

	this.dataReceivedHandler;	//	handler when client report data is received
	this.completeHandler;	//	handler when task done
	
	//	Distribute data
	this.distributeData = function(){
		if (distributedData)
			return;

		var rowStart = 0;
		var workSize = Math.ceil(size/Object.keys(clients).length);
		resultSize = Object.keys(clients).length;

		//	For simplicity, we distribute the entire matrix
		for (var id in clients){
			rtcStarServer.send(id, "matrixmul.data", {
				matrixA: matrixA, 
				matrixB: matrixB,
				rowStart: rowStart, 
				rowEndExclusive: rowStart+workSize,
			});
			rowStart += workSize;
		}
		distributedData = true;
	}

	//	Server do entire task alone
	this.doTaskAlone = function(){
		return computeMatrix({
			matrixA: matrixA,
			matrixB: matrixB,
			rowStart: 0,
			rowEndExclusive: matrixA.length,
		});
	}

	//	Start workers
	this.startTask = function(){
		if (startedTask)
			return;

		result = generateMatrix(matrixA.length, matrixA.length, false);
		rtcStarServer.broadcast("matrixmul.start");
		startedTask = true;
	}

	//	When workers complete
	rtcStarServer.on('matrixmul.taskCompleted', function(message){
		var rowStart = message.data.rowStart;
		var rowEndExclusive = message.data.rowEndExclusive;
		var workerResult = message.data.result;

		for (var i = rowStart; i < rowEndExclusive; i++)
			result[i] = workerResult[i];

		resultSize -= 1;
		console.log("Server: results left ", resultSize);
		//	Completed task
		if (resultSize == 0){
			distributedData = false;
			startedTask = false;
			_this.completeHandler(result);
		}
	});

	rtcStarServer.on('matrixmul.dataReceived', function(message){
		if (_this.dataReceivedHandler)
			_this.dataReceivedHandler(message);
	});

	//	Init
	matrixA = generateMatrix(size, size, true);
	matrixB = generateMatrix(size, size, true);

	rtcStarServer.on("$enter", function(message){
	    var id = message.data.id;
	    clients[id] = true;
	  });

	  rtcStarServer.on("$leave", function(message){
	    var id = message.data.id;
	    delete clients[id];
	  });
}