/*
*
*   A Peer that acts as the cilent.
*   Each message sent between servers and client has: type, timestamp, data.
*   System events are prefix with a $ for type.
*
*/
function RTCStarClient(){



  /*** Variables ***/
  var _this = this;
  _this._clientPeer;
  _this._serverConnection;
  _this._eventHandlers = {}; //  $open, $close, $error, $enter, $leave, $list, $call
  _this.debug = false;



  /*** Private Methods ***/

  //  Trigger event handlers for an event
  _this._triggerEvent = function(eventType, message){
    if (_this.debug)
      console.log("Trigger", eventType, message)

    if (_this._eventHandlers[eventType])
      for (var i in _this._eventHandlers[eventType])
        _this._eventHandlers[eventType][i](message);
  }

    //  Add timestamp
  _this._triggerSystemEvent = function(eventType, message){
    _this._triggerEvent(eventType, {data: message, timestamp: new Date()});
  }
}



/*** Methods ***/

// Start client
RTCStarClient.prototype.start = function(serverPeerId, id, options){

  //  Init Peer
  var _this = this;
  _this._clientPeer = new Peer(id, options)

  /*** PeerJS Event Handlers ***/

  //  PeerJS Open
  function peerjsOpenHandler(){
    if (_this.debug)
      console.log("Client started",_this._clientPeer.id, serverPeerId);

    //  Connect to server
    _this._serverConnection = _this._clientPeer.connect(serverPeerId);
    _this._serverConnection.on('open', openHandler);
    _this._serverConnection.on('data', dataHandler);
    _this._serverConnection.on('close', closeHandler);
    _this._serverConnection.on('error', errorHandler);
  }

  //  PeerJS Close
  function peerjsCloseHandler(){
    _this._triggerEvent("$close");
  }

  //  PeerJS Error
  function peerjsErrorHandler(err){
    _this._triggerEvent("$error", err);
  }

  //  Client Call
  function peerjsCallHandler(callConn){
    _this._triggerEvent("$call", callConn);
  }


   /*** Client Event Handlers ***/

  //  Client Open
  function openHandler(){
    if (_this.debug)
      console.log("Client connected to server",_this._clientPeer.id, serverPeerId);
    
    _this._triggerSystemEvent("$open", {id: _this._clientPeer.id});
  }

    //  Client Close
  function closeHandler(){
    if (_this.debug)
      console.log("Client closed, id: "+_this._clientPeer.id, serverPeerId);

    _this._triggerSystemEvent("$close");
  }

    //  Client Error
  function errorHandler(err){
    _this._triggerSystemEvent("$error", err);
  }

  //  Client Data
  function dataHandler(message){
    message = JSON.parse(message);
    if (_this.debug)
      console.log("Data", message);

    //  Trigger
    _this._triggerEvent(message.type, message);
  } 


  _this._clientPeer.on('open', peerjsOpenHandler);
  _this._clientPeer.on('close', peerjsCloseHandler);
  _this._clientPeer.on('error', peerjsErrorHandler);
  _this._clientPeer.on('call', peerjsCallHandler);
}

//  To stop the client
RTCStarClient.prototype.stop = function(){
  this._clientPeer.destroy();
}



// Adds a handler to a particular message. Message is a json object.
RTCStarClient.prototype.on = function(type, handler){
  if (!this._eventHandlers[type])
    this._eventHandlers[type] = [];
  this._eventHandlers[type].push(handler);
}

//  Removes a handler for a particular message
RTCStarClient.prototype.off = function(type, handler){
  if (this._eventHandlers[type]){
    var index = this._eventHandlers[type].indexOf(handler);
    if (index > -1) 
      this._eventHandlers[type].splice(index, 1);
  }
} 



//  Sends a request to server, message.type contains the type. Message is a json object.
RTCStarClient.prototype.request = function(type, data){
  var message = {
    timestamp: new Date(),
    data: data,
    type: type
  };

  if (this.debug)
    console.log("Request", message);

  this._serverConnection.send(JSON.stringify(message));
}




//  Returns the PeerJS ID of client
RTCStarClient.prototype.getClientPeerId = function(){
  return this._clientPeer.id;
}

//  PeerJS call function
RTCStarClient.prototype.call = function(peerId, stream){
  var callSent = this._clientPeer.call(peerId, stream);
  return callSent;
}
