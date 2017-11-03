// const ErrorHandler={
//   CreateDescription: function(e){
//     console.log(e);
//   },
//   AddCandidate: function(e){
//     console.log(e);
//   }
// };
// function MainFactory(){
//   var self = this;
//   this.connectButton = null;
//   this.disconnectButton = null;
//   this.sendButton = null;
//   this.messageInputBox = null;
//   this.receiveBox = null;
//
//   this.localConnection = null;   // RTCPeerConnection for our "local" connection
//   this.remoteConnection = null;  // RTCPeerConnection for the "remote"
//
//   this.sendChannel = null;       // RTCDataChannel for the local (sender)
//   this.receiveChannel = null;    // RTCDataChannel for the remote (receiver)
//
//   //Functions
//
//   this.startup = function() {
//     this.connectButton = document.getElementById('connectButton');
//     this.disconnectButton = document.getElementById('disconnectButton');
//     this.sendButton = document.getElementById('sendButton');
//     this.messageInputBox = document.getElementById('message');
//     this.receiveBox = document.getElementById('receivebox');
//
//     // Set event listeners for user interface widgets
//
//     this.connectButton.addEventListener('click', this.connectPeers, false);
//     this.disconnectButton.addEventListener('click', this.disconnectPeers, false);
//     this.sendButton.addEventListener('click', this.sendMessage, false);
//   }
//
//   this.connectPeers = function(){
//     this.localConnection = new RTCPeerConnection();
//
//     this.sendChannel = this.localConnection.createDataChannel("sendChannel");
//     this.sendChannel.onopen = this.handleSendChannelStatusChange;
//     this.sendChannel.onclose = this.handleSendChannelStatusChange;
//
//     this.remoteConnection = new RTCPeerConnection();
//     this.remoteConnection.ondatachannel = this.receiveChannelCallback;
//
//     this.localConnection.onicecandidate = e => !e.candidate
//       || this.remoteConnection.addIceCandidate(e.candidate)
//       .catch(ErrorHandler.AddCandidate);
//
//     this.remoteConnection.onicecandidate = e => !e.candidate
//       || this.localConnection.addIceCandidate(e.candidate)
//       .catch(ErrorHandler.AddCandidate);
//
//     this.localConnection.createOffer()
//       .then(offer => this.localConnection.setLocalDescription(offer))
//       .then(() => this.remoteConnection.setRemoteDescription(this.localConnection.localDescription))
//       .then(() => this.remoteConnection.createAnswer())
//       .then(answer => this.remoteConnection.setLocalDescription(answer))
//       .then(() => this.localConnection.setRemoteDescription(this.remoteConnection.localDescription))
//       .catch(ErrorHandler.CreateDescription);
//   }
//
//   this.handleLocalAddCandidateSuccess = function() {
//     this.connectButton.disabled = true;
//   }
//
//   this.handleRemoteAddCandidateSuccess = function() {
//     this.disconnectButton.disabled = false;
//   }
//
//   this.receiveChannelCallback = function(event) {
//     this.receiveChannel = event.channel;
//     this.receiveChannel.onmessage = this.handleReceiveMessage;
//     this.receiveChannel.onopen = this.handleReceiveChannelStatusChange;
//     this.receiveChannel.onclose = this.handleReceiveChannelStatusChange;
//   }
//
//   this.handleSendChannelStatusChange = function(event) {
//     if (this.sendChannel) {
//       var state = this.sendChannel.readyState;
//
//       if (state === "open") {
//         this.messageInputBox.disabled = false;
//         this.messageInputBox.focus();
//         this.sendButton.disabled = false;
//         this.disconnectButton.disabled = false;
//         this.connectButton.disabled = true;
//       } else {
//         this.messageInputBox.disabled = true;
//         this.sendButton.disabled = true;
//         this.connectButton.disabled = false;
//         this.disconnectButton.disabled = true;
//       }
//     }
//   }
//
//   this.handleReceiveChannelStatusChange = function(event) {
//     if (this.receiveChannel) {
//       console.log("Receive channel's status has changed to " +
//                   this.receiveChannel.readyState);
//     }
//   }
//
//   this.sendMessage = function() {
//     var message = this.messageInputBox.value;
//     this.sendChannel.send(message);
//
//     this.messageInputBox.value = "";
//     this.messageInputBox.focus();
//   }
//
//   this.handleReceiveMessage = function(event) {
//     var el = document.createElement("p");
//     var txtNode = document.createTextNode(event.data);
//
//     el.appendChild(txtNode);
//     this.receiveBox.appendChild(el);
//   }
//
//   this.disconnectPeers = function() {
//
//     // Close the RTCDataChannels if they're open.
//
//     this.sendChannel.close();
//     this.receiveChannel.close();
//
//     // Close the RTCPeerConnections
//
//     this.localConnection.close();
//     this.remoteConnection.close();
//
//     this.sendChannel = null;
//     this.receiveChannel = null;
//     this.localConnection = null;
//     this.remoteConnection = null;
//
//     // Update user interface elements
//
//     this.connectButton.disabled = false;
//     this.disconnectButton.disabled = true;
//     this.sendButton.disabled = true;
//
//     this.messageInputBox.value = "";
//     this.messageInputBox.disabled = true;
//   }
//   //window.addEventListener("load", this.startup, false);
// }
//
// window.RTCData = new MainFactory();
// window.addEventListener("load", window.RTCData.startup, false);

(function() {

  // Define "global" variables

  var connectButton = null;
  var disconnectButton = null;
  var sendButton = null;
  var messageInputBox = null;
  var receiveBox = null;

  var localConnection = null;   // RTCPeerConnection for our "local" connection
  var remoteConnection = null;  // RTCPeerConnection for the "remote"

  var sendChannel = null;       // RTCDataChannel for the local (sender)
  var receiveChannel = null;    // RTCDataChannel for the remote (receiver)

  // Functions

  // Set things up, connect event listeners, etc.

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

  // Connect the two peers. Normally you look for and connect to a remote
  // machine here, but we're just connecting two local objects, so we can
  // bypass that step.

  function connectPeers() {
    // Create the local connection and its event listeners

    localConnection = new RTCPeerConnection();

    // Create the data channel and establish its event listeners
    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;

    // Create the remote connection and its event listeners

    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = receiveChannelCallback;

    // Set up the ICE candidates for the two peers

    localConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);

    remoteConnection.onicecandidate = e => !e.candidate
        || localConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);

    // Now create an offer to connect; this starts the process

    localConnection.createOffer()
    .then(offer => localConnection.setLocalDescription(offer))
    .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
    .then(() => remoteConnection.createAnswer())
    .then(answer => remoteConnection.setLocalDescription(answer))
    .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
    .catch(handleCreateDescriptionError);
  }

  // Handle errors attempting to create a description;
  // this can happen both when creating an offer and when
  // creating an answer. In this simple example, we handle
  // both the same way.

  function handleCreateDescriptionError(error) {
    console.log("Unable to create an offer: " + error.toString());
  }

  // Handle successful addition of the ICE candidate
  // on the "local" end of the connection.

  function handleLocalAddCandidateSuccess() {
    connectButton.disabled = true;
  }

  // Handle successful addition of the ICE candidate
  // on the "remote" end of the connection.

  function handleRemoteAddCandidateSuccess() {
    disconnectButton.disabled = false;
  }

  // Handle an error that occurs during addition of ICE candidate.

  function handleAddCandidateError() {
    console.log("Oh noes! addICECandidate failed!");
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.

  function sendMessage() {
    var message = messageInputBox.value;
    sendChannel.send(message);

    // Clear the input box and re-focus it, so that we're
    // ready for the next message.

    messageInputBox.value = "";
    messageInputBox.focus();
  }

  // Handle status changes on the local end of the data
  // channel; this is the end doing the sending of data
  // in this example.

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

  // Called when the connection opens and the data
  // channel is ready to be connected to the remote.

  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }

  // Handle onmessage events for the receiving channel.
  // These are the data messages sent by the sending channel.

  function handleReceiveMessage(event) {
    var el = document.createElement("p");
    var txtNode = document.createTextNode(event.data);

    el.appendChild(txtNode);
    receiveBox.appendChild(el);
  }

  // Handle status changes on the receiver's channel.

  function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  receiveChannel.readyState);
    }

    // Here you would do stuff that needs to be done
    // when the channel's status changes.
  }

  // Close the connection, including data channels if they're open.
  // Also update the UI to reflect the disconnected status.

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

  // Set up an event listener which will run the startup
  // function once the page is done loading.

  window.addEventListener('load', startup, false);
})();
