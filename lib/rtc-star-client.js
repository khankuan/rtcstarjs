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
    if (_this._eventHandlers[eventType])
      for (var i in _this._eventHandlers[eventType])
        _this._eventHandlers[eventType][i](message);
  }
}



/*** Methods ***/

// Start client
RTCStarClient.Prototype.start = function(serverPeerId, id, options){

  //  Init Peer
  this._clientPeer = new Peer(id, options)


  /*** PeerJS Event Handlers ***/

  //  PeerJS Open
  function peerjsOpenHandler(){
    if (debug)
      console.log("Client started, id: "+this._clientPeer.id);

    //  Connect to server
    this._serverConnection = this._clientPeer.connect(serverPeerId);
    this._serverConnection.on('open', openHandler);
    this._serverConnection.on('data', dataHandler);
    this._serverConnection.on('close', closeHandler);
    this._serverConnection.on('error', errorHandler);
  }

  //  PeerJS Close
  function peerjsCloseHandler(){
    this._triggerEvent("$close");
  }

  //  PeerJS Error
  function peerjsErrorHandler(err){
    this._triggerEvent("$error", err);
  }

  //  Client Call
  function peerjsCallHandler(callConn){
    this._triggerEvent("$call", callConn);
  }


   /*** Client Event Handlers ***/

  //  Client Open
  function openHandler(){
    if (this.debug)
      console.log("Client connected to server, id: "+this._clientPeer.id, serverPeerId);
    
    this._triggerEvent("$open", this._clientPeer.id);
  }

    //  Client Close
  function closeHandler(){
    if (_this.debug)
      console.log("Client closed, id: "+_this._clientPeer.id, _this_.serverPeerId);

    this._triggerEvent("$close");
  }

    //  Client Error
  function errorHandler(err){
    this._triggerEvent("$error", err);
  }

  //  Client Data
  function dataHandler(message){
    if (debug)
      console.log(message);

    //  Trigger
    this._triggerEvent(message.type, message);
  } 


  this._clientPeer.on('open', peerjsOpenHandler);
  this._clientPeer.on('close', peerjsCloseHandler);
  this._clientPeer.on('error', peerjsErrorHandler);
  this._clientPeer.on('call', peerjsCallHandler);
}

//  To stop the client
RTCStarClient.Prototype.stop = function(){
  this._clientPeer.destroy();
}



// Adds a handler to a particular message. Message is a json object.
RTCStarClient.Prototype.on = function(type, handler){
  if (!this._eventHandlers[type])
    this._eventHandlers[type] = [];
  this._eventHandlers[type].push(handler);
}

//  Removes a handler for a particular message
RTCStarClient.Prototype.off = function(type, handler){
  if (this._eventHandlers[type]){
    var index = this._eventHandlers[type].indexOf(handler);
    if (index > -1) 
      this._eventHandlers[type].splice(index, 1);
  }
} 



//  Sends a request to server, message.type contains the type. Message is a json object.
RTCStarClient.Prototype.request = function(type, data){
  var message = {
    timestamp: new Date(),
    data: data,
    type: type
  };
  this._serverConnection.send(message);
}




//  Returns the PeerJS ID of client
RTCStarClient.Prototype.getClientPeerId = function(){
  return this._clientPeer.id;
}

//  PeerJS call function
RTCStarClient.Prototype.call = function(peerId, stream){
  var callSent = this._clientPeer.call(peerId, stream);
  return callSent;
}
