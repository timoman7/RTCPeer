function MainFactory(){
  var self = this;
  var connectButton = null;
  var disconnectButton = null;
  var sendButton = null;
  var messageInputBox = null;
  var receiveBox = null;

  var localConnection = null;   // RTCPeerConnection for our "local" connection
  var remoteConnection = null;  // RTCPeerConnection for the "remote"

  var sendChannel = null;       // RTCDataChannel for the local (sender)
  var receiveChannel = null;    // RTCDataChannel for the remote (receiver)

  this.toReturn = {
    connectButton,
    disconnectButton,
    sendButton,
    messageInputBox,
    receiveBox,
    localConnection,
    remoteConnection,
    sendChannel,
    receiveChannel
  };

  //Functions

  function startup() {
    connectButton = document.getElementById('connectButton');
    disconnectButton = document.getElementById('disconnectButton');
    sendButton = document.getElementById('sendButton');
    messageInputBox = document.getElementById('message');
    receiveBox = document.getElementById('receivebox');

    // Set event listeners for user interface widgets

    connectButton.addEventListener('click', connectPeers, false);
    disconnectButton.addEventListener('click', disconnectPeers, false);
    sendButton.addEventListener('click', sendMessage, false);

  }
  const ErrorHandler={
    CreateDescription: function(e){
      console.log(e);
    },
    AddCandidate: function(e){
      console.log(e);
    }
  };

  function connectPeers(){
    localConnection = new RTCPeerConnection();

    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;

    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = receiveChannelCallback;

    localConnection.onicecandidate = e => !e.candidate
      || remoteConnection.addIceCandidate(e.candidate)
      .catch(ErrorHandler.AddCandidate);

    remoteConnection.onicecandidate = e => !e.candidate
      || localConnection.addIceCandidate(e.candidate)
      .catch(ErrorHandler.AddCandidate);

    localConnection.createOffer()
      .then(offer => localConnection.setLocalDescription(offer))
      .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
      .then(() => remoteConnection.createAnswer())
      .then(answer => remoteConnection.setLocalDescription(answer))
      .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
      .catch(ErrorHandler.CreateDescription);
  }

  function handleLocalAddCandidateSuccess() {
    connectButton.disabled = true;
  }

  function handleRemoteAddCandidateSuccess() {
    disconnectButton.disabled = false;
  }

  function receiveChannelCallback(event) {
    var receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }

  function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;

      if (state === "open") {
        messageInputBox.disabled = false;
        messageInputBox.focus();
        sendButton.disabled = false;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
      } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      }
    }
  }

  function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  receiveChannel.readyState);
    }
  }

  function sendMessage() {
    var message = messageInputBox.value;
    sendChannel.send(message);

    messageInputBox.value = "";
    messageInputBox.focus();
  }

  function handleReceiveMessage(event) {
    var el = document.createElement("p");
    var txtNode = document.createTextNode(event.data);

    el.appendChild(txtNode);
    receiveBox.appendChild(el);
  }

  function disconnectPeers() {

    // Close the RTCDataChannels if they're open.

    sendChannel.close();
    receiveChannel.close();

    // Close the RTCPeerConnections

    localConnection.close();
    remoteConnection.close();

    sendChannel = null;
    receiveChannel = null;
    localConnection = null;
    remoteConnection = null;

    // Update user interface elements

    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sendButton.disabled = true;

    messageInputBox.value = "";
    messageInputBox.disabled = true;
  }
  window.addEventListener("load", startup, false);
  return {
    toReturn: this.toReturn,
    Recursive: self
  };
}

window.RTCData = new MainFactory();
