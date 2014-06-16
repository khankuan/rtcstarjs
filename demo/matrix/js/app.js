
//  Variables
var startedTaskTime;
var matrixMulServer;
var rtcStarServer;
var size;
var local = false;


//  Init click handlers
function startServerClicked(){
  size = parseInt($("#dataSize").val() || 800);
  startServer($("#startServerName").val(), size);
}

function startClientClicked(){
  startClient($("#joinServerName").val())
}

function distributeDataClicked(){
  if (rtcStarServer.getClientList().length == 0){
    appendLog("0 clients yet!");
    return;
  }

  var distributeDataTime = new Date().getTime();
  matrixMulServer.distributeData();
  appendLog("Distributing Data, "+((new Date().getTime() - distributeDataTime)/1000)+ " seconds, pls wait for all clients to receive..");
}

function startTaskClicked(){
  matrixMulServer.startTask();
  startedTaskTime = new Date().getTime();
  appendLog("Started Task");
}

function doTaskAlone(){
  var aloneStartTaskTime = new Date().getTime();
  matrixMulServer.doTaskAlone();
  appendLog("Completed task alone of size "+size+", "+((new Date().getTime() - aloneStartTaskTime)/1000)+ " seconds");
}



//  Become a server
function startServer(name, size){
  rtcStarServer = new RTCStarServer();
  rtcStarServer.debug = true;
  matrixMulServer = new MatrixMulServer(rtcStarServer, size);

  //  When job done
  matrixMulServer.completeHandler = function(){
    appendLog("Completed task of size "+ size +", "+((new Date().getTime() - startedTaskTime)/1000)+ " seconds");
  }

  //  When client received data
  matrixMulServer.dataReceivedHandler = function(message){
    appendLog("Data sent to "+message.clientId);
  }

  //  Start
  rtcStarServer.on("$open", function(message){
    appendLog("Server started, size: "+size);
  });

  //  Track clients
  rtcStarServer.on("$enter", function(message){
    var id = message.data.id;
    var element = document.createElement('div');
    element.innerHTML = id;
    element.setAttribute("id", id);
    $('#clients').append(element);
  });

  rtcStarServer.on("$leave", function(message){
    var id = message.data.id;
    $('#'+id).remove();
  });

  //  Start server
  if (local)
    rtcStarServer.start(name, {key: "ee56xhnb894ibe29", debug: 3, host: "127.0.0.1", port: 5000});
  else
    rtcStarServer.start(name, {key: "ee56xhnb894ibe29"});
  appendLog("Server Starting");
}



//  Become a client, join a server
function startClient(name){


  //  Init
  var rtcStarClient = new RTCStarClient();
  rtcStarClient.debug = true;
  var matrixMulClient = new MatrixMulClient(rtcStarClient);

  //  Log handler
  matrixMulClient.logHandler = appendLog;

  //  Start
  rtcStarClient.on("$open", function(message){
    appendLog("Client started");
  });

  //  Start
  if (local)
    rtcStarClient.start(name, {key: "ee56xhnb894ibe29", host: "127.0.0.1", port: 5000});
  else
    rtcStarClient.start(name, {key: "ee56xhnb894ibe29"});
}


//  Appends to log div
function appendLog(message){
  var element = document.createElement('div');
  element.innerHTML = message;
  $('#logs').append(element);
}