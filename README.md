RTCStarJS
=========

A multi-peer server/client, real-time communication of data or media for your site without the need of a backend server!

RTCStarJS is a wrapper around PeerJS. Using PeerJs P2P implementation, RTCStarJS builds a star topology (Server & Client) on top on PeerJS. 

[Main site and API References](http://rtcstarjs.com)

Setup 
=========
Import the following .js files, 

```html
<script src="js/rtcstarjs/adapter.js"></script> 
<script src="js/rtcstarjs/peer.js"></script> 
<script src="js/rtcstarjs/rtcstarclient.js"></script> 
<script src="js/rtcstarjs/rtcstarserver.js"></script>
```

Usage
=========
Typically, a host user would initiate and start a RTCStarServer on his browser. Others, including himself, will then create a RTCStarClient each to communication with the server. The server serves as a centralised point for broadcasting and logic for the application that you will be building. 

Init Server code 

```js
var server = new RtcStarServer(); 
    
//  Events are standardised, such as ClientEnter, ClientLeave
server.onServerEvent('Open',function(server_id){
});

//  Requests can be any type, used for application communication
server.onServerRequest('Chat',function(request){
});

//  All set, start server
server.start();
```    

Init Client code 

```js
var client = new RtcStarClient(); 

//  Events are standardised, such as ClientEnter, ClientLeave
client.onClientEvent('Open',function(client_id){
});

//  Messages can be any type, used for application communication
client.onMessage('Chat',function(message){
});

client.start(server_id);
```

Peer-to-peer chat example
=========
Client Component for chat:

```js
var ChatWidgetClient = function(rtcStarClient) {

    var delegate;
    rtcStarClient.onClientEvent('Open', openHandler);
    rtcStarClient.onMessage('Chat', chatHandler); //  Register listener to Chat
    
    //  To delegate task of updating the view
    this.setdelegate = function(d) {
        delegate = d;
    }
          
    //  Send button on html
    this.sendchat = function(text) {
        var message = new Object();
        message.type = 'Chat';
        message.text = text;
        message.subType = 'NewChat';
        
        rtcStarClient.request(message);
    }
    
    //  When client is started
    function openHandler(peerId) {
        if (delegate) {
            delegate.onOpen(peerId);
        }
    }
          
    //  When received a chat message
    function chatHandler(message) {
        if (delegate) {
            delegate.onMessage(message);
        }
    }
}
```

Server Component for chat:

```js
var ChatWidgetServer = function(rtcStarServer) {
    var history;
    rtcStarServer.onServerEvent('Open', init);
    rtcStarServer.onServerEvent('ClientEnter', initClient);
    rtcStarServer.onRequest('Chat', newChat);        //        Listen to Chat requests
      
    //  When server starts
    function init(serverId) {
        history = [];
    }

    //  When a new user enters, we send the chat history
    function initClient(peerId) {
        var message = {};
        message.type = 'Chat';
        message.subType = 'Init';
        message.data = history;
        rtcStarServer.send(peerId, message);
    }
      
    //  When receiving a new chat, we store the message and broadcast it
    function newChat(message) {
        //  Storing history of chat 
        history.push(message);
        rtcStarServer.broadcast(message);
    }
}
```


Demonstration
==

Head to http://rtcstarjs.com/ChatDemo.html for a demo!
