function RTCStarServer(){

  /*** Data ***/
  var serverPeer;
  var peerConnections;
  var eventHandlers = {}; //  Open, Close, Error, ClientEnter, ClientLeave
  var requestHandlers = {};
  var debug = false;


  /*** Public methods ***/
  
  this.debug = function(d){
    debug = d;
  }

  // Adds a handler to a particular server event
  this.onServerEvent = function(event, handler){
    if (eventHandlers[event] == null)
      eventHandlers[event] = [];
    eventHandlers[event].push(handler);
  }

  //  Removes a handler for a particular server event
  this.removeOnServerEvent = function(event, handler){
    if (eventHandlers[event] != null){
      var index = eventHandlers[event].indexOf(handler);
      if (index > -1) 
        eventHandlers[event].splice(index, 1);
    }
  }

  // Adds a handler to a particular request
  this.onRequest = function(type, handler){
    if (requestHandlers[type] == null)
      requestHandlers[type] = [];
    requestHandlers[type].push(handler);
  }

  //  Removes a handler for a particular request
  this.removeOnRequest = function(type, handler){
    if (requestHandlers[type] != null){
      var index = requestHandlers[type].indexOf(handler);
      if (index > -1) 
        requestHandlers[type].splice(index, 1);
    }
  } 

  //  Starts the server
  this.start = function(){
    //  Create peer
    serverPeer = new Peer({key: 'fxv643daihuuwhfr'});

    //  Event handlers
    serverPeer.on('open', peerjsOpenHandler);
    serverPeer.on('close', peerjsCloseHandler);
    serverPeer.on('error', peerjsErrorHandler);
    serverPeer.on('connection', peerjsConnectionHandler);
  }

  //  Stops the server
  this.stop = function(){
    serverPeer.destroy();
  }

  //  Sends a message to a particular client
  this.send = function(peerId, message){
    send(peerId, "message:"+JSON.stringify(message));
  }

  //  Broadcast a message to all connected clients
  this.broadcast = function(message){
    broadcast("message:"+JSON.stringify(message));
  }
 
  //  Returns the PeerJS ID of server
  this.getServerPeerId = function(){
    return serverPeer.id;
  }



  /*** Internal methods ***/

  //  Send a message to a peer
  function send(peerId, message){
    peerConnections[peerId].send(message);
  }

  //  Broadcast a message to all connected clients
  function broadcast(message){
    for (var peerConnection in peerConnections)
      peerConnections[peerConnection].send(message);
  }



  /*** PeerJS Event Handlers ***/

  //  PeerJS Open
  function peerjsOpenHandler(){
    if (debug)
      console.log("Server started, id: "+serverPeer.id);

    //  Reset peers
    peerConnections = {};
    
    if (eventHandlers['Open'] != null)
      for (var i in eventHandlers['Open'])
        eventHandlers['Open'][i](serverPeer.id);
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

  //  PeerJS Connection
  function peerjsConnectionHandler(conn){
    conn.on('open', function(){
      if (debug)
        console.log("New peer: "+conn.peer);

      var id = conn.peer;

      //  Store connection
      peerConnections[id] = conn;

      //  ClientEnter handler
      if (eventHandlers['ClientEnter'] != null)
          for (var i in eventHandlers['ClientEnter'])
              eventHandlers['ClientEnter'][i](id);

      //  Broadcast to add users new user has joined
      var message = new RoomRTCMessage(id);
      message.type = "ClientEnter";
      broadcast("event:"+JSON.stringify(message));

      //  Send user list with ids to new connection
      var message = new RoomRTCMessage(Object.keys(peerConnections));
      message.type = "PeerList";
      conn.send("event:"+JSON.stringify(message));
  

      /*** Connection Handlers ***/
      
      //  Connection Data
      conn.on('data', function(data){
        if (debug)
          console.log(data);

        var datatype = data.substring(0,data.indexOf(":"));
        var messageString = data.substring(data.indexOf(":")+1, data.length);

        var message = JSON.parse(messageString);
        message.peerId = id;
        message.timestamp = new Date().getTime();

        if (datatype == 'broadcast'){
          broadcast("message:"+messageString);
        } else if (datatype == 'request'){
          var type = message['type'];
          if (requestHandlers[type] != null)
            for (var i in requestHandlers[type])
              requestHandlers[type][i](message);
        }
      });

      //  Connection Close
      conn.on('close', function(){
        if (peerConnections[id] == null)
          return;

        delete peerConnections[id];

        if (eventHandlers['ClientLeave'] != null)
          for (var i in eventHandlers['ClientLeave'])
            eventHandlers['ClientLeave'][i](id);

        var message = new RoomRTCMessage(id);
        message.type = "ClientLeave";
        broadcast("event:"+JSON.stringify(message));
      });

      //  Connection Error
      conn.on('error', function(err){
        if (peerConnections[id] == null)
          return;
        
        delete peerConnections[id];

        if (eventHandlers['ClientLeave'] != null)
          for (var i in eventHandlers['ClientLeave'])
            eventHandlers['ClientLeave'][i](err);

        var message = new RoomRTCMessage(id);
        message.type = "ClientLeave";
        broadcast("event:"+JSON.stringify(message));

      });
    });
  }


  /*** Messages structure ***/
  function RoomRTCMessage(data){
    this.type = "";
    this.data = data;
    this.timestamp = new Date().getTime();
  }
}
