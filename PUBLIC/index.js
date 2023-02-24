var socket    = io();

var messages  = document.getElementById('messages');
var chatbox   = document.getElementById('chatbox');
var chatinput = document.getElementById('chatinput');
var usern     = undefined;
var unattendedPings = 0;

var dnd = false;

function getCookie(cookieName) {
  var name = cookieName + "=";
  var ca = document.cookie.split(';');

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if ((c.indexOf(name)) == 0) {
      return c.substr(name.length);
    }
  }
  return null;
}

function replace_content_URL(content) {
  var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  var element_content = content.replace(exp_match, "<a href='$1'>$1</a>");
  var new_exp_match = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  var new_content = element_content.replace(new_exp_match, '$1<a target="_blank" href="http://$2">$2</a>');
  return new_content;
}

window.onload = function() {
  usern  = getCookie("username");
  pfpURL = getCookie("pfp");
  
  if (usern != undefined || usern != null) {
    //log in
    socket.emit('login', usern);
  } else {
    //make login
    window.location.href = "/login";
  }
}

chatbox.addEventListener('submit', function(e) {
  e.preventDefault();

  // check if has message content and username
  if (chatinput.value) {
    if (chatinput.value.toLowerCase() == "/clear") {
      messages.innerHTML = "";
      chatinput.value = '';
    } else if (chatinput.value.toLowerCase() == "/dnd") {
      dnd = -dnd;
    } else {
      var emitContent = { username: usern, content: chatinput.value, pfp: pfpURL }

      socket.emit('chat message', emitContent);
      chatinput.value = '';
    }
  }
});

socket.on('chat message', function(msg) {
  var msgContent      = document.createElement('li');
  var usernameItalics = document.createElement('i');
  var pfp             = document.createElement('img');

  let isPing = false;

  var newmsgcontent = msg.content;
  
  newmsgcontent = replace_content_URL(newmsgcontent);
  newmsgcontent = parseMarkdown(newmsgcontent);

  if (newmsgcontent.toLowerCase()
    .indexOf(`@${usern.toLowerCase()}`)
    != newmsgcontent.indexOf(` - ${usern.toLowerCase()}`)) {

    isPing = true;
    msgContent.style.background = "orangered"

    if (document.hidden) {
      if (!dnd)
        document.getElementById('ding').play();
      
      unattendedPings++;
      document.title = `JACA - ${unattendedPings} mentions`;
    }
  }

  const d = new Date();

  msgContent.innerHTML = newmsgcontent.replace("[nl]", "<br />");
  let timeFormat = `${d.getHours()}h:${d.getMinutes()}m:${d.getSeconds()}s`
  usernameItalics.textContent     = ` - ${msg.username} @ ${timeFormat}`;
  usernameItalics.style.opacity   = '50%';

  // set up profile picture
  if(
    msg.pfp != null || msg.pfp != undefined || msg.pfp == "") {
    pfp.src                = msg.pfp;
    pfp.alt                = msg.username;
    pfp.style.width        = "20px";
    pfp.style.height       = "20px";
    pfp.style.borderRadius = "50px"
    pfp.style.border       = "solid";
    pfp.style.borderColor  = "gray";

    msgContent.appendChild(pfp);
    msgContent.appendChild(usernameItalics);
    messages.appendChild(msgContent);
  } else {
    msgContent.appendChild(usernameItalics);
    messages.appendChild(msgContent);
  }
  
  window.scrollTo(0, document.body.scrollHeight);
});

window.onfocus = function() {
    if (unattendedPings != 0) {
      unattendedPings = 0;
      document.title = "just another chat app";
    }
};


socket.on('login', function(msg) {
  var msgContent = document.createElement('li');
  var usernameContent = document.createElement('i');

  usernameContent.textContent = `${msg} has logged in.`;

  msgContent.appendChild(usernameContent);
  messages.appendChild(msgContent);

  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('logout', function(msg) {
  var msgContent = document.createElement('li');
  var usernameContent = document.createElement('i');

  usernameContent.textContent = `${msg} has logged out.`;

  msgContent.appendChild(usernameContent);
  messages.appendChild(msgContent);

  window.scrollTo(0, document.body.scrollHeight);
});


socket.on('user check', function(msg) {
  socket.emit('user check', usern);
});


document.addEventListener("unload", function() {
  socket.emit('logout', usern);
});

document.getElementById("logoutstuff")
  .addEventListener("click", () => {
  socket.emit('logout', usern);
});
