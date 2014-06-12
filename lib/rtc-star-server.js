

/*
*
*   A Peer that acts as the server (star node).
*   Each message sent between servers and client has: type, timestamp, data.
*   System events are prefix with a $ for type.
*
*/
function RTCStarServer(){



  /*** Variables ***/
  var _this = this;
  _this._serverPeer;
  _this._connections;
  _this._eventHandlers = {}; //  $open, $close, $error, $enter, $leave
  _this.debug = false;



  /*** Private Methods ***/

  //  Trigger event handlers for an event
  _this._triggerEvent = function(eventType, message){
    if (_this._eventHandlers[eventType])
      for (var i in _this._eventHandlers[eventType])
        _this._eventHandlers[eventType][i](message);
  }

};


/*** Methods ***/

// Start server
Prototype.RTCStarServer.start = function(id, options){

  //  Init Peer
  this._serverPeer = new Peer(id, options);



  /*** PeerJS Event Handlers ***/

  //  PeerJS Open
  function peerjsOpenHandler(){
    if (this.debug)
      console.log("Server started, id: "+this._serverPeer.id);

    //  Reset peers
    this._peerConnections = {};
    
    //  Trigger
    this._triggerEvent("$open", {serverId: this._serverPeer.id});
  }


  //  PeerJS Close
  function peerjsCloseHandler(){
    this._triggerEvent("$close");
  }

  //  PeerJS Error
  function peerjsErrorHandler(err){
    this._triggerEvent("$error");
  }

  //  PeerJS Connection
  function peerjsConnectionHandler(conn){
    conn.on('open', function(){
      if (this.debug)
        console.log("New peer: "+conn.peer);

      var id = conn.peer;

      //  Store connection
      this._peerConnections[id] = conn;

      //  Enter handler
      this._triggerEvent("$enter");

      //  Broadcast to all users new user has joined
      this.broadcast("$enter", {id: id});

      //  Send user list with ids to new connection
      this.send(id, "$list", {ids: Object.keys(this._connections)});

      /*** Connection Handlers ***/
      
      //  Connection Data
      conn.on('data', function(data){
        if (debug)
          console.log(data);

        //  Trigger
        this._triggerEvent(message.type, message);
      });

      //  Connection Close and Error
      function closeOrError(){

        //  Delete connection
        delete this._connections[id];

        //  Trigger
        this._triggerEvent("$leave", {id: id});

        //  Notify
        this.broadcast("$leave", {id: id});
      };

      conn.on('close', closeOrError);
      conn.on('error', function(err){
        if (this.debug)
          console.log(err);
        closeOrError();
      });
  }


  //  Event handlers
  this._serverPeer.on('open', peerjsOpenHandler);
  this._serverPeer.on('close', peerjsCloseHandler);
  this._serverPeer.on('error', peerjsErrorHandler);
  this._serverPeer.on('connection', peerjsConnectionHandler);
}

//  Stops the server
Prototype.RTCStarServer.stop = function(){
  this._serverPeer.destroy();
}



//  Add a handler for a particular event
Prototype.RTCStarServer.on = function(type, handler){
  if (!this._eventHandlers[type])
    this._eventHandlers[type] = [];
  this._eventHandlers[type].push(handler);
}

//  Removes a handler for a particular event
Prototype.RTCStarServer.off = function(type, handler){
  if (this._eventHandlers[type]){
    var index = this._eventHandlers[type].indexOf(handler);
    if (index > -1) 
      this._eventHandlers[type].splice(index, 1);
  }
} 



//  Sends a message to a particular client
Prototype.RTCStarServer.send = function(peerId, type, data){
  var message = {
    timestamp: new Date(),
    data: data,
    type: type
  };
  this._connections[peerId].send(message);
}

//  Broadcast a message to all connected clients
Prototype.RTCStarServer.broadcast = function(type, data){
  var message = {
    timestamp: new Date(),
    data: data,
    type: type
  }
  for (var i in this._connections)
    this._connections[i].send(message);
}



//  Returns the PeerJS ID of server
Prototype.RTCStarServer.getServerPeerId = function(){
  return this._serverPeer.id;
}

//  Returns the list of connected clients
Prototype.RTCStarServer.getClientList = function(){
  var clientList = this._connections.map(function(conn){
    return conn.peer;
  });
  return clientList;
}
