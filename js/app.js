var UserName = ''
var ChatRoom = ''
var LoggedIn = false

// Hide the chat room page
$("#chat").hide();

// Connect to the platform
this.ClientApi.connect('192.168.3.241', '11100', function () {
  console.log('Connected To server');
})

// Register callback with the platform
this.ClientApi.registerCallback('chat-engine', 'login', function (args) {
  console.log('Login Response', args);

  // Dispplay error if login failed
  if (!args.Ack) {
    Materialize.toast(args.Error, 4000)
    return
  }

  // Toggle pages
  LoggedIn = true
  $("#login").hide();
  $("#chat").show();
})

// Register callback with the platform
this.ClientApi.registerCallback('chat-engine', 'chat', function (args) {
  if (LoggedIn) {
    console.log('Chat Response', args);

    // Append the message to the existing messages
    if (args.Username !== UserName) $("#content").append("<div class=\"col s12\"><div class=\"message left green lighten-2\"><h6><b>" + args.Username + "</b></h6>" + args.Message + "</div></div>")
    else $("#content").append("<div class=\"col s12\"><div class=\"message blue right lighten-2\"><h6><b>" + args.Username + "</b></h6>" + args.Message + "</div></div>")

    // Scroll to the bottom of the screen
    $('#content').scrollTop($('#content')[0].scrollHeight);
  }
})

// The login function
function login() {

  // Get values from the text fields
  UserName = $('#username').val();
  ChatRoom = $('#chatroom').val();

  // Call a function on the engine connected to the platform
  this.ClientApi.call('chat-engine', 'login', { Username: UserName, Chatroom: ChatRoom })
  $('#chatRoomName').html(ChatRoom);
}

// Simple Logout functions
function logout() {
  LoggedIn = false
  UserName = ''
  $("#chat").hide();
  $("#login").show();
}

// Function to send messages
function sendMessage() {
  this.ClientApi.call('chat-engine', 'chat', { Username: UserName, Chatroom: ChatRoom, Message: $('#message').val() })
  $('#message').val('')
}
