function FileSharingClient(rtcStarClient){
	
	var _this = this;
	this.fileListHandler;
	this.progressHandler;
	var buffer = {};
	var chunksCount = {};
	var startTime = {};

	this.download = function(name){
		rtcStarClient.request("file.requestNewFile", {name: name, chunk: 0});
		startTime[name] = new Date();
	}

	rtcStarClient.on('file.fileList', function(message){
		if (_this.fileListHandler)
			_this.fileListHandler(message);
	});

	rtcStarClient.on('file.downloadFile', function(message){
		if (!chunksCount[message.data.file.name]){
			buffer[message.data.file.name] = [];
			chunksCount[message.data.file.name] = 0;
		}

		if (_this.progressHandler)
			_this.progressHandler(message.data.file, (chunksCount[message.data.file.name]+1)/message.data.total, (new Date() - startTime[message.data.file.name]));


		buffer[message.data.file.name][message.data.chunk] = message.data.data;
		chunksCount[message.data.file.name]++;

		if (chunksCount[message.data.file.name] == message.data.total){
			var download = document.createElement('a');

		    var data = buffer[message.data.file.name];
		    var blob = new Blob(data);
		    download.href = URL.createObjectURL(blob);
		    download.download = message.data.file.name;
		    $('body').append(download);
			download.click();
			$(download).remove();

		    delete buffer[message.data.file.name];
		    delete startTime[message.data.file.name];
		    delete chunksCount[message.data.file.name];
		} else {
			rtcStarClient.request("file.requestNewFile", {name: message.data.file.name, chunk: message.data.chunk + 1});
		}
	});
}