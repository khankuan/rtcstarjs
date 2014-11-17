
var local = false;


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
  var fileServer = new FileSharingServer(rtcStarServer);

  //  Delete file
  window.removeFile = function(filename){
    fileServer.removeFile({name: filename});
    $("div[id='server-file-"+filename + "']")[0].remove();
  }

  //  Add file button
  $('#fileUpload').on('change', function(){
    var files = $('#fileUpload')[0].files;
    for (var i = 0; i < files.length; i++){
      fileServer.addFile(files[i]);

      var element = document.createElement('div');
      element.id = "server-file-" + files[i].name;
      element.innerHTML = "<span>" + files[i].name + " (" + files[i].size + ' bytes) </span><button onclick="removeFile(\'' + files[i].name+ '\')">Remove</button>';
      $('#server-files').append(element);
    }

    setTimeout(function(){$('#fileUpload').val("");},0);
  });

  if (local)
    rtcStarServer.start(name, {key: "ee56xhnb894ibe29", host: "127.0.0.1", port: 5000});
  else
    rtcStarServer.start(name, {key: "ee56xhnb894ibe29", debug: 4});
}






//  Become a client, join a server
function startClient(name){


  //  Init
  var rtcStarClient = new RTCStarClient();
  rtcStarClient.debug = true;
  var fileSharingClient = new FileSharingClient(rtcStarClient);



  //  Request download
  window.downloadFile = function(file){
    fileSharingClient.download(file);
  }

  //  Update on file list
  fileSharingClient.fileListHandler = function(message){
    var fileList = message.data;
    $('#client-files')[0].innerHTML = "";
    for (var i in fileList){
      var element = document.createElement('div');
      element.innerHTML = '<button onclick="downloadFile(\'' + fileList[i].name + '\')">' + fileList[i].name + '</button> (' + fileList[i].size + " bytes)";
      $('#client-files').append(element);
    }
  }

  fileSharingClient.progressHandler = function(file, percent, time){
    $('#client-progress')[0].innerHTML = file.name + " " + Math.ceil(percent*100) + "%" + ", took " + Math.round(time)/1000 + " secs, at " + Math.round(file.size*percent/time)/1000 + " MB/s" ;
  }

  //  Start
  if (local)
    rtcStarClient.start(name, {key: "ee56xhnb894ibe29", host: "127.0.0.1", port: 5000});
  else
    rtcStarClient.start(name, {key: "ee56xhnb894ibe29", debug: 4});
}









//  Helper function
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}