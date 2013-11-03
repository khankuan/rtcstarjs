RTCStarJS
=========

A star topology client-server framework for WebRTC using PeerJS. 

RTCStarJS is a wrapper around PeerJS. Using PeerJs p2p implementation, RTCStarJS wrapped plugins (chat and video) around it to allow developer to enable peer to peer chat or video conference with a few methods. 

[Main site and API References](http://rtcstarjs.com)

[Download](https://dl.dropboxusercontent.com/u/10597187/RTCStarJS.zip)

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
One user would have to be both server and client while the others only have to initialize the client.

Init Server code 

    var server = new rtcstarserver(); 
    
    server.start();
    
    server.onServerEvent('open',function(server_id){
    	//this is the server ID 
    })

Init Client code 

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

Peer to peer video example
=========
One user will have to run initServer which will call initClient, other user can simply run initClient with the given server id provided.

    function initserver() { 
      
      //server creation code 
      var server = new rtcstarserver(); 

      //setting up widget necessary 
      var videowidgetserver = new videowidgetserver(server); 

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
      var videowidgetclient = new videowidgetclient(client); 

      //starting the client 
      client.start(); 

      videowidgetclient.onstart(function(localstream){  
        //set where you want to display your own stream 

       }) 

      videowidgetclient.oncall(function(stream){ 
        //set where do you want to display other's stream 
      }) 
    
    } 

[Demo](http://rtcstarjs.com/VideoDemo.html)
