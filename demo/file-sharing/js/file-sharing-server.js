var FileSharingServer = function(rtcStarServer){

	var files;
	var filesData;
	var _this = this;
	this.bufferSize = 600000;
	
	function init(){
		files = {};	//	name: (name, data, size)
		filesData = {};
	}

	//	Function to return file list info
	function fileList(){
		var fileList = [];
		for (var key in files)
			fileList.push(fileMeta(files[key]));
		return fileList;
	}

	//	Convert a file to fileMeta
	function fileMeta(file){
		return JSON.parse(JSON.stringify(file));
	}
	
	//	New Client
	function initClient(message){
		var id = message.data.id;
		rtcStarServer.send(id, "file.fileList", fileList());
	}
	
	//	New download
	function newFile(message){
		var clientId = message.clientId;
		var name = message.data.name;

		var reader = new FileReader();
		reader.onload = function(e){
			if (e.target.readyState == 2){
				console.log("Loaded " + files[name].size + " bytes")

				var total = Math.ceil(e.target.result.byteLength / _this.bufferSize);
				for (var i = 0; i < total; i++){
					var data = e.target.result.slice(i*_this.bufferSize, (i+1)*_this.bufferSize);
					rtcStarServer.send(clientId, "file.downloadFile", {file: fileMeta(files[name]), data: data, chunk: i, total: total});
				}
			}
		}
		reader.readAsArrayBuffer(files[name]);
	}

	rtcStarServer.on('$open', init);
	rtcStarServer.on('$enter', initClient);
	rtcStarServer.on('file.requestNewFile', newFile);

	//	Load file
	function loadFile(){

	}

	//	Methods
	this.addFile = function(file){
		files[file.name] = file;
		rtcStarServer.broadcast('file.fileList', fileList());
	}

	this.removeFile = function(file){
		delete files[file.name];
		rtcStarServer.broadcast('file.fileList', fileList());
	}
}