

var BoardClient = function(client){
	var delegate;
	this.setDelegate = function(boardDelegate){
		delegate = boardDelegate;
	};

	//	Methods
	this.newTab = function(metadata){
		var request = new Object();
		request.type = "Board";
		request.subType = "NewTab";
		request.metadata = metadata;
		client.request(request);
	}

	this.closeTab = function(tabId){
		var request = new Object();
		request.type = "Board";
		request.subType = "CloseTab";
		request.tabIndex = tabId;
		client.request(request);
	}

	this.switchTab = function(tabId){
		var request = new Object();
		request.type = "Board";
		request.subType = "SwitchTab";
		request.tabIndex = tabId;
		client.request(request);
	}

	this.updateCursor = function(cursorData){
		var request = new Object();
		request.type = "Board";
		request.subType = "UpdateCursor";
		request.cursorData = cursorData;
		client.request(request);
	}

	this.updateScroll = function(tabIndex, coords){
		var request = new Object();
		request.type = "Board";
		request.subType = "UpdateScroll";
		request.tabIndex = tabIndex;
		request.scrollTime = new Date().getTime();
		request.coords = coords;
		client.request(request);
	}

	//	Message
	var messageHandler = function(message){
		if (message.subType == "NewTab")
			delegate.onNewTab(message);
		else if (message.subType == "SwitchTab")
			delegate.onSwitchTab(message);
		else if (message.subType == "CloseTab")
			delegate.onCloseTab(message);
		else if (message.subType == "UpdateScroll")
			delegate.onUpdateScroll(message);
		else if (message.subType == "UpdateCursor")
			delegate.onUpdateCursor(message);
	};
	client.onMessage('Board', messageHandler);
}