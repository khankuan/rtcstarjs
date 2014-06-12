
//  Init click handlers
function startServerClicked(){
  startServer($("#startServerName").val())
}

function joinServerClicked(){
  startClient($("#joinServerName").val())
}






//  Become a server
function startServer(name){
  var rtcStarServer = new RTCStarServer();
  rtcStarServer.debug = true;
  var chatServer = new ChatServer(rtcStarServer);

  rtcStarServer.start(name, {key: "ee56xhnb894ibe29", debug: 3});
}

//  Become a client, join a server
function startClient(name){


  //  Init
  var rtcStarClient = new RTCStarClient();
  rtcStarClient.debug = true;
  var chatClient = new ChatClient(rtcStarClient);



  //  Prepare chat client
  function appendChat(chat){
    var element = document.createElement('div');
    element.innerHTML = chat.timestamp + ": " + chat.clientId + ": " + chat.content;
    $('#chats').append(element);
  }

  chatClient.initHandler = function(message){
    var chatHistory = message.data;
    for (var i in chatHistory)
      appendChat(chatHistory[i]);
  }

  chatClient.newChatHandler = function(message){
    appendChat(message.data);
  }

  chatClient.disableChatHandler = function(){
    $('#sendChat').prop("disabled",true);
  }

  $('#sendChat').on('click', function(){
    var content = $('#chatbox').val();
    $('#chatbox').val("");
    chatClient.sendChat(content);
  });

  //  Clients
  function appendClient(id){
    var element = document.createElement('div');
    element.innerHTML = id;
    element.setAttribute("id", id);
    $('#clients').append(element);
  }

  function removeClient(id){
    $('#'+id).remove();
  }

  rtcStarClient.on("$list", function(message){
    var ids = message.data.ids;
    for (var i in ids)
      appendClient(ids[i]);
  });

  rtcStarClient.on("$enter", function(message){
    var id = message.data.id;
    appendClient(id);
  });

  rtcStarClient.on("$leave", function(message){
    var id = message.data.id;
    removeClient(id);
  });

  //  Start
  rtcStarClient.start(name, {key: "ee56xhnb894ibe29"});
}