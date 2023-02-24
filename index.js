const express    = require('express');
var   app        = require('express')();
const http       = require('http');
var   httpServer = http.Server(app);
var   io         = require('socket.io')(httpServer);
const path       = require('path');

var util = require('util');
var users = [];

var port = 8080;

var Version = "release 02.24.23";

function getTimeEST() {
    //EST
    offset = -5.0

    clientDate = new Date();
    utc = clientDate.getTime() + (clientDate.getTimezoneOffset() * 60000);

    serverDate = new Date(utc + (3600000*offset));

    return serverDate.toLocaleString();
}

app.use(express.static(path.join(__dirname, 'PUBLIC')));

app.use((req, res, next) => {
  res.status(404);
  res.sendFile(path.join(__dirname, '/PUBLIC/404.html'));
});

io.on('connection', (socket) => {
  socket.on('login', msg => {
    try {
      if (!msg) {
        /* drop */
      } else {
        if (msg.length >= 16 || msg.length <= 3) {
          socket.redirect('https://jaca.jased.repl.co/');
        } else {
          console.log(` > [LOGIN] from ${msg} /\\ at time ${getTimeEST()}`);
  
          io.emit('login', msg);
        }
      }
    } catch { /* drop */ }
  });

  socket.on('logout', msg => {
    try {
      // message is an object, containing Username and Content
      if (!msg) {
        /* drop */
      } else {
        console.log(` > [LOGOUT] from ${msg} /\\ at time ${getTimeEST()}`);

        io.emit('logout', msg);
      }
    } catch { /* drop */ }
  });

  socket.on('chat message', msg => {
    try {
      // message is an object, containing Username and Content
      if (!msg.username || !msg.content) {
        /* drop */
      } else {
        if (msg.username.length > 16) {
          res.redirect("https://jaca.jased.repl.co/");
        } else {
          console.log(` > [MESSAGE] from ${msg.username} - ${msg.content} /\\ at time ${getTimeEST()}`);

          if (msg.content.toLowerCase() == "/users") {
            users = []
  
            io.emit('user check', undefined);
            console.log("usercheck");

            io.emit('chat message', {username:"Server", content:`Usercheck requested from ${msg.username}`});
          
            setTimeout(function() {
              if (users.length != 0){
                let obj = new Set(users);
                let uniqueArray = Array.from(obj);  
                
                let body = {
                  username: "Server",
                  content: `@${msg.username} Users online: ${uniqueArray}`
                }
                
                io.emit('chat message', body);
              }
            }, 3000);
          } else if (msg.content.toLowerCase() == "/sversion") {
            let body = {
              username: "Server",
              content: `Server running version ${Version}`
            }
            
            io.emit('chat message', body);
          } else if (msg.content.toLowerCase() == "@everyone") {
            io.emit('chat message', {username:msg.username,content:`Spicy Italian Meatball`});
          } else {
            io.emit('chat message', msg);
          }
        }
      }
    } catch { /* drop */ }

    socket.on('user check', msg => {
      users.push(msg);
    });
  });
});

httpServer.listen(port, () => {
  console.log(` - server listening!
    port ${port}`);
});

httpServer.on('request', function(req, res) {
  console.log(`\x1b[32m > ${req.socket.remoteAddress} ${req.method} ${req.url}
     Code ${res.statusCode}\x1b[0m`);
});