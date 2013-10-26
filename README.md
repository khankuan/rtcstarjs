RTCStarJS
=========

A star topology client-server framework for WebRTC using PeerJS. 

RTCStarJS is a wrapper around PeerJS. Using PeerJs p2p implementation, RTCStarJS wrapped plugins (chat and video) around it to allow developer to enable peer to peer chat or video conference with a few methods. 

Setup 
=========
Import the following .js files, 

    <script src="js/rtcstarjs/adapter.js"></script> 
    <script src="js/rtcstarjs/peer.js"></script> 
    <script src="js/rtcstarjs/rtcstarclient.js"></script> 
    <script src="js/rtcstarjs/rtcstarserver.js"></script>

If you want peer to peer chat functionality add this

    <script src="js/rtcstarjs/plugin/chatclient.js"></script> 
    <script src="js/rtcstarjs/plugin/chatserver.js"></script> 

For peer to peer video functionality, add the following

    <script src="js/rtcstarjs/plugin/videoclient.js"></script> 
    <script src="js/rtcstarjs/plugin/videoserver.js"></script>

Usage
=========
One user would have to be both server and client.

Init Server 

    var server = new rtcstarserver(); 
    
    server.start();
    
    server.onServerEvent('open',function(server_id){
    	//this is the server ID 
    })

Init Client

    var client = new rtcstarclient(); 
    client.start(server_id);


Peer to peer chat example
=========
One user will have to run initServer which will call initClient, other user can simply run initClient with the given server id provided.

    function initserver() { 
      
      //server creation code 
      var server = new rtcstarserver(); 

      //setting up widget necessary 
      var chatwidgetserver = new chatwidgetserver(server); 

      //starting the server 
      server.start(); 

      server.onserverevent('open',function(server_id){ 
        initclient(server_id); 
      }); 
    } 

    function initclient(server_id) { 
      //server creation code 
      var client = new rtcstarclient(); 

      //setting up widget necessary 
      var chatwidgetclient = new chatwidgetclient(client); 

      //starting the client 
      client.start(); 

      chatwidgetclient.onmessage(function(message){ 
        //message.peerid is the sender id 
        //message.text is the content 
        //do what you want with the messages 
     }) 
    } 

[Demo](http://rtcstarjs.com/ChatDemo.html)

Demo and Guide
=========
www.rtcstarjs.com 