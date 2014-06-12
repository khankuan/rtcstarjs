RTCStarJS
=========

A multi-peer server/client, real-time communication of data or media for your site without the need of a backend server!

RTCStarJS is a wrapper around PeerJS. Using PeerJs P2P implementation, RTCStarJS builds a star topology (Server & Client) on top on PeerJS. 


Setup 
=========
Import the following .js files, 

    <script src="js/vendor/adapter.js"></script> 
    <script src="js/vendor/peer.js"></script> 
    <script src="js/vendor/rtc-star-client.js"></script> 
    <script src="js/vendor/rtc-star-server.js"></script>


Usage
=========
Typically, a host user would initiate and start a RTCStarServer on his browser. Others, including himself, will then create a RTCStarClient each to communicate with the server. The server serves as a centralised point for broadcasting and logic for the application that you will be building. 

Init Server code 

    var server = new RTCStarServer(); 
    
    //  System Events are prefix with $, includes: $open, $close, $error, $enter, $leave
    server.on('$open',function(server_id){
    });

    //  Request events of any other types
    server.on('chat.requestNewChat',function(request){
    });

    //  All set, start server
    server.start("MyCoolServerName", peerjs_options);
    

Init Client code 

    var client = new RTCStarClient();

    //  System Events including: $open, $close, $error, $enter, $leave, $list, $call
    client.on('$open',function(client_id){
    });

    //  Messages can be any type, used for application communication
    client.on('chat.newChat',function(message){
    });

    client.start(server_name, peerjs_options);


Peer to peer chat example
=========
Client Component for chat:

    function ChatClient(rtcStarClient){
  
      var _this = this;
      this.initHandler;
      this.newChatHandler;
      this.disableChatHandler;
      
      this.sendChat = function(text){
        rtcStarClient.request("chat.requestNewChat", text);
      }

      rtcStarClient.on('chat.init', function(message){
        if (_this.initHandler)
          _this.initHandler(message);
      });
      rtcStarClient.on('chat.newChat', function(message){
        if (_this.newChatHandler)
          _this.newChatHandler(message);
      });
      rtcStarClient.on('$close', function(message){
        if (_this.disableChatHandler)
          _this.disableChatHandler(message);
      });
      rtcStarClient.on('$error', function(message){
        if (_this.disableChatHandler)
          _this.disableChatHandler(message);
      });
    }

Server Component for chat:

    var ChatServer = function(rtcStarServer){

      var history;
      
      function init(){
        history = [];
      }
      
      function initClient(message){
        var id = message.id;

        if (history)
          rtcStarServer.send(id, "chat.init", history);
      }
      
      function newChat(message){
        var chat = {clientId: message.clientId, content: message.data, timestamp: new Date()};
        history.push(chat);
        rtcStarServer.broadcast("chat.newChat", chat);
      }

      rtcStarServer.on('$open', init);
      rtcStarServer.on('$enter', initClient);
      rtcStarServer.on('chat.requestNewChat', newChat);
    }


