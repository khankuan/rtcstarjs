
function RTCStarClient(){

  /*** Data ***/
  var clientPeer;
  var serverPeerId;
  var serverConnection;
  var eventHandlers = {}; //  Open, Close, Error, ClientEnter, ClientLeave, ClientList, Call
  var messageHandlers = {};
  var debug = false;
  this.key = "";

  /*** Public methods ***/
  this.debug = function(d){
    debug = d;
  }

  this.setHost = function(host){
    clientPeer.host = host;
  }

  //  Adds a handler to a particular client event
  this.onClientEvent = function(event, handler){
    if (eventHandlers[event] == null)
      eventHandlers[event] = [];
    eventHandlers[event].push(handler);
  }

  //  Removes a handler for a particular server event
  this.removeOnClientEvent = function(event, handler){
    if (eventHandlers[event] != null){
      var index = eventHandlers[event].indexOf(handler);
      if (index > -1) 
        eventHandlers[event].splice(index, 1);
    }
  }

  // Adds a handler to a particular message. Message is a json object.
  this.onMessage = function(type, handler){
    if (messageHandlers[type] == null)
      messageHandlers[type] = [];
    messageHandlers[type].push(handler);
  }

  //  Removes a handler for a particular message
  this.removeOnMessage = function(type, handler){
    if (messageHandlers[type] != null){
      var index = messageHandlers[type].indexOf(handler);
      if (index > -1) 
        messageHandlers[type].splice(index, 1);
    }
  } 

  //  Sends a request to server, message.type contains the type. Message is a json object.
  this.request = function(message){
    serverConnection.send("request:"+JSON.stringify(message));
  }

  //  Ask the server to broadcast a message. Message is a json object.
  this.broadcast = function(message){
    serverConnection.send("broadcast:"+JSON.stringify(message));
  }

  //  To start the client
  this.start = function(serverId){
    //  Create peer
    clientPeer = new Peer({key: this.key}, {secure: true});
    serverPeerId = serverId;

    //  Event handlers
    clientPeer.on('open', peerjsOpenHandler);
    clientPeer.on('close', peerjsCloseHandler);
    clientPeer.on('error', peerjsErrorHandler);
    clientPeer.on('call', peerjsCallHandler);
  }

  //  To stop the client
  this.stop = function(){
    clientPeer.destroy();
  }

  //  Returns the PeerJS ID of client
  this.getClientPeerId = function(){
    return clientPeer.id;
  }

  //  PeerJS call function
  this.call = function(peerId, stream){
    var callSent = clientPeer.call(peerId, stream);
    return callSent;
  }


   /*** PeerJS Event Handlers ***/

  //  PeerJS Open
  function peerjsOpenHandler(){
    if (debug)
      console.log("Client started, id: "+clientPeer.id);

    //  Connect to server
    serverConnection = clientPeer.connect(serverPeerId);
    serverConnection.on('open', openHandler);
    serverConnection.on('data', dataHandler);
    serverConnection.on('close', closeHandler);
    serverConnection.on('error', errorHandler);
  }

  //  PeerJS Close
  function peerjsCloseHandler(){
    if (eventHandlers['Close'] != null)
      for (var i in eventHandlers['Close'])
        eventHandlers['Close'][i]();
  }

  //  PeerJS Error
  function peerjsErrorHandler(err){
    if (eventHandlers['Error'] != null)
      for (var i in eventHandlers['Error'])
        eventHandlers['Error'][i](err);
  }

  //  Client Call
  function peerjsCallHandler(callConn){
    if (eventHandlers['Call'] != null)
      for (var i in eventHandlers['Call'])
        eventHandlers['Call'][i](callConn);
  }


   /*** Client Event Handlers ***/

  //  Client Open
  function openHandler(){
    if (debug)
      console.log("Client connected, id: "+clientPeer.id);
    
    if (eventHandlers['Open'] != null)
      for (var i in eventHandlers['Open'])
        eventHandlers['Open'][i](clientPeer.id);
  }

    //  Client Close
  function closeHandler(){
    if (eventHandlers['Close'] != null)
      for (var i in eventHandlers['Close'])
        eventHandlers['Close'][i](serverPeerId);
  }

    //  Client Error
  function errorHandler(){
    if (eventHandlers['Error'] != null)
      for (var i in eventHandlers['Error'])
        eventHandlers['Error'][i](serverPeerId);
  }

  //  Client Data
  function dataHandler(data){
    if (debug)
      console.log(data);

    var datatype = data.substring(0,data.indexOf(":"));
    var message = JSON.parse(data.substring(data.indexOf(":")+1, data.length));
    
    if (message['type'] == null)
      return;

    //  Events
    if (datatype == "event"){
      if (eventHandlers[message.type] != null)
        for (var i in eventHandlers[message.type])
          eventHandlers[message.type][i](message);

    //  Messages
    } else if (datatype == "message"){
      if (messageHandlers[message.type] != null)
        for (var i in messageHandlers[message.type])
          messageHandlers[message.type][i](message);
    }

  } 


}


