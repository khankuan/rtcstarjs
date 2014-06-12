

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
RTCStarServer.prototype.start = function(id, options){

  //  Init Peer
  var _this = this;
  _this._serverPeer = new Peer(id, options);



  /*** PeerJS Event Handlers ***/

  //  PeerJS Open
  function peerjsOpenHandler(){
    if (_this.debug)
      console.log("Server started", _this._serverPeer.id);

    //  Reset peers
    _this._connections = {};
    
    //  Trigger
    _this._triggerEvent("$open", {serverId: _this._serverPeer.id});
  }


  //  PeerJS Close
  function peerjsCloseHandler(){
    _this._triggerEvent("$close");
  }

  //  PeerJS Error
  function peerjsErrorHandler(err){
    _this._triggerEvent("$error");
  }

  //  PeerJS Connection
  function peerjsConnectionHandler(conn){
    conn.on('open', function(){
      if (_this.debug)
        console.log("New peer: "+conn.peer);

      var id = conn.peer;

      //  Broadcast to all users new user has joined
      _this.broadcast("$enter", {id: id});

      //  Store connection
      _this._connections[id] = conn;

      //  Enter handler
      _this._triggerEvent("$enter", {id: id});

      //  Send user list with ids to new connection
      _this.send(id, "$list", {ids: Object.keys(_this._connections)});

      /*** Connection Handlers ***/
      
      //  Connection Data
      conn.on('data', function(request){
        if (_this.debug)
          console.log(request);

        //  Trigger
        request.clientId = id;
        _this._triggerEvent(request.type, request);
      });

      //  Connection Close and Error
      function closeOrError(){

        //  Delete connection
        delete _this._connections[id];

        //  Trigger
        _this._triggerEvent("$leave", {id: id});

        //  Notify
        _this.broadcast("$leave", {id: id});
      };

      conn.on('close', closeOrError);
      conn.on('error', function(err){
        if (_this.debug)
          console.log(err);
        closeOrError();
      });
    });
  }


  //  Event handlers
  _this._serverPeer.on('open', peerjsOpenHandler);
  _this._serverPeer.on('close', peerjsCloseHandler);
  _this._serverPeer.on('error', peerjsErrorHandler);
  _this._serverPeer.on('connection', peerjsConnectionHandler);
}

//  Stops the server
RTCStarServer.prototype.stop = function(){
  this._serverPeer.destroy();
}



//  Add a handler for a particular event
RTCStarServer.prototype.on = function(type, handler){
  if (!this._eventHandlers[type])
    this._eventHandlers[type] = [];
  this._eventHandlers[type].push(handler);
}

//  Removes a handler for a particular event
RTCStarServer.prototype.off = function(type, handler){
  if (this._eventHandlers[type]){
    var index = this._eventHandlers[type].indexOf(handler);
    if (index > -1) 
      this._eventHandlers[type].splice(index, 1);
  }
} 



//  Sends a message to a particular client
RTCStarServer.prototype.send = function(peerId, type, data){
  var message = {
    timestamp: new Date(),
    data: data,
    type: type
  };
  this._connections[peerId].send(message);
}

//  Broadcast a message to all connected clients
RTCStarServer.prototype.broadcast = function(type, data){
  var message = {
    timestamp: new Date(),
    data: data,
    type: type
  }
  for (var i in this._connections)
    this._connections[i].send(message);
}



//  Returns the PeerJS ID of server
RTCStarServer.prototype.getServerPeerId = function(){
  return this._serverPeer.id;
}

//  Returns the list of connected clients
RTCStarServer.prototype.getClientList = function(){
  var clientList = this._connections.map(function(conn){
    return conn.peer;
  });
  return clientList;
}
