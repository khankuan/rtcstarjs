var BoardServer = function(server){
	var tabs;
	var tabNextIndex;
	var currentTab;

	//	Listeners
	server.onServerEvent('Open', init);
	server.onServerEvent('ClientEnter', initClient);
	server.onServerEvent('ClientLeave', removeClient);
	server.onRequest('Board', boardHandler);

	//	Handlers
	function init(serverId){
		tabs = new Object();
		currentTab = "";
		tabNextIndex = 0;
	}

	function initClient(peerId){
		var message = new Object();
		message.type = 'Board';
		message.subType = 'Init';
		message.data = {'tabs': tabs, 'currentTab': currentTab};
		server.send(peerId, message);
	}

	function removeClient(peerId){
		var message = new Object();
		message.type = "Board";
		message.subType = "CursorRemoved";
		message.cursorPeerId = peerId;
		server.broadcast(message);
	}
	
	function boardHandler(request){
		var message = request;

		if (request.subType == "NewTab"){
			message.tabIndex = tabNextIndex+"";
			tabNextIndex++;

			//	Add to data
			tabs[message.tabIndex] = new Object();
			tabs[message.tabIndex].metadata = request.metadata;
			tabs[message.tabIndex].scrollCoords = {x: 0, y: 0};
			tabs[message.tabIndex].canvasData = {};
		} 

		
		else if (request.subType == "CloseTab"){
			//	Remove from data
			delete tabs[message.tabIndex];
		} 


		else if (request.subType == "SwitchTab"){
			//	Update data
			currentTab = message.tabIndex;
		} 


		else if (request.subType == "CursorChanged"){
			message.cursorPeerId = request.peerId;
		} 


		else if (request.subType == "Tab"){
			if (request.tabSubType == "Scroll"){

				//	Update tab
				tabs[request.tabIndex].scrollCoords = request.scrollCoords;
			}


			else if (request.tabSubType == "Drawing"){
				
				//	Update tab canvas data
				if (tab[request.tabIndex].canvasData[request.drawingPage] == undefined)
					tab[request.tabIndex].canvasData[request.drawingPage] = [];
				tab[request.tabIndex].canvasData[request.drawingPage].push(request.drawingAction);
			}
		}


		server.broadcast(message);
	}
}