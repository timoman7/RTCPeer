const ErrorHandler={
  CreateDescription: function(e){
    console.log(e);
  },
  AddCandidate: function(e){
    console.log(e);
  }
};
function MainFactory(){
  var self = this;
  this.connectButton = null;
  this.disconnectButton = null;
  this.sendButton = null;
  this.messageInputBox = null;
  this.receiveBox = null;

  this.localConnection = null;   // RTCPeerConnection for our "local" connection
  this.remoteConnection = null;  // RTCPeerConnection for the "remote"

  this.sendChannel = null;       // RTCDataChannel for the local (sender)
  this.receiveChannel = null;    // RTCDataChannel for the remote (receiver)

  //Functions

  this.startup = function() {
    this.connectButton = document.getElementById('connectButton');
    this.disconnectButton = document.getElementById('disconnectButton');
    this.sendButton = document.getElementById('sendButton');
    this.messageInputBox = document.getElementById('message');
    this.receiveBox = document.getElementById('receivebox');

    // Set event listeners for user interface widgets

    this.connectButton.addEventListener('click', this.connectPeers, false);
    this.disconnectButton.addEventListener('click', this.disconnectPeers, false);
    this.sendButton.addEventListener('click', this.sendMessage, false);
  }

  this.connectPeers = function(){
    this.localConnection = new RTCPeerConnection();

    this.sendChannel = this.localConnection.createDataChannel("this.sendChannel");
    this.sendChannel.onopen = this.handleSendChannelStatusChange;
    this.sendChannel.onclose = this.handleSendChannelStatusChange;

    this.remoteConnection = new RTCPeerConnection();
    this.remoteConnection.ondatachannel = this.receiveChannelCallback;

    this.localConnection.onicecandidate = e => !e.candidate
      || this.remoteConnection.addIceCandidate(e.candidate)
      .catch(ErrorHandler.AddCandidate);

    this.remoteConnection.onicecandidate = e => !e.candidate
      || this.localConnection.addIceCandidate(e.candidate)
      .catch(ErrorHandler.AddCandidate);

    this.localConnection.createOffer()
      .then(offer => this.localConnection.setLocalDescription(offer))
      .then(() => this.remoteConnection.setRemoteDescription(this.localConnection.localDescription))
      .then(() => this.remoteConnection.createAnswer())
      .then(answer => this.remoteConnection.setLocalDescription(answer))
      .then(() => this.localConnection.setRemoteDescription(this.remoteConnection.localDescription))
      .catch(ErrorHandler.CreateDescription);
  }

  this.handleLocalAddCandidateSuccess = function() {
    this.connectButton.disabled = true;
  }

  this.handleRemoteAddCandidateSuccess = function() {
    this.disconnectButton.disabled = false;
  }

  this.receiveChannelCallback = function(event) {
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = handleReceiveMessage;
    this.receiveChannel.onopen = handleReceiveChannelStatusChange;
    this.receiveChannel.onclose = handleReceiveChannelStatusChange;
  }

  this.handleSendChannelStatusChange = function(event) {
    if (this.sendChannel) {
      var state = this.sendChannel.readyState;

      if (state === "open") {
        this.messageInputBox.disabled = false;
        this.messageInputBox.focus();
        this.sendButton.disabled = false;
        this.disconnectButton.disabled = false;
        this.connectButton.disabled = true;
      } else {
        this.messageInputBox.disabled = true;
        this.sendButton.disabled = true;
        this.connectButton.disabled = false;
        this.disconnectButton.disabled = true;
      }
    }
  }

  this.handleReceiveChannelStatusChange = function(event) {
    if (this.receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  this.receiveChannel.readyState);
    }
  }

  this.sendMessage = function() {
    var message = this.messageInputBox.value;
    this.sendChannel.send(message);

    this.messageInputBox.value = "";
    this.messageInputBox.focus();
  }

  this.handleReceiveMessage = function(event) {
    var el = document.createElement("p");
    var txtNode = document.createTextNode(event.data);

    el.appendChild(txtNode);
    this.receiveBox.appendChild(el);
  }

  this.disconnectPeers = function() {

    // Close the RTCDataChannels if they're open.

    this.sendChannel.close();
    this.receiveChannel.close();

    // Close the RTCPeerConnections

    this.localConnection.close();
    this.remoteConnection.close();

    this.sendChannel = null;
    this.receiveChannel = null;
    this.localConnection = null;
    this.remoteConnection = null;

    // Update user interface elements

    this.connectButton.disabled = false;
    this.disconnectButton.disabled = true;
    this.sendButton.disabled = true;

    this.messageInputBox.value = "";
    this.messageInputBox.disabled = true;
  }
  window.addEventListener("load", this.startup, false);
}

window.RTCData = new MainFactory();
