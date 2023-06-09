const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//data.json 
const fs = require("fs");

let datas = [];

function loadData() {
  try {
    const fileContents = fs.readFileSync("./data.json");
    datas = JSON.parse(fileContents);
  } catch (err) {
    datas = [];
  }
}

loadData();

fs.watch("./data.json", () => {
  loadData();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/test2.html');
});

app.get('/old', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    socket.on('chat id', (ids) => {
        console.log(`New user: ${ids}`);
        for (let i = 0; i < datas.length; i++) {
            socket.emit('update', { user: datas[i].user, msg: datas[i].msg, id: datas[i].id });
        }
    });

    socket.on('rm_post', (post) => {
        console.log(`Post: ${post.index} deleted`);
        datas.splice(5, 1);
    });

    socket.on('event', (usr) => {
        
        // console.log(`User: ${usr.user}`)
        // console.log(`Msg: ${usr.msg}`)

    if(usr.msg.includes("!cmd")){
        if(usr.msg === "!cmd rm"){
            console.log("removing data");
            fs.writeFile("data.json", "[]", function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was emptied!");
            });
        }
    }else{
            let msgid = datas.length + 1;
	    // add date
	    const now = new Date();
            const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1 to get 1-12
            const day = now.getDate();
	    const year = now.getFullYear().toString().slice(-2); // get last two digits of year
	    const hours = now.getHours();
	    const minutes = now.getMinutes();
	    const timestamp = `${month}/${day}/${year} - ${hours}:${minutes}`;

            let msgdata = {
                msg: usr.msg,
                user: `${usr.user} ${timestamp}`,
                id: msgid,
            };
            datas.push(msgdata);
            fs.writeFile("data.json", JSON.stringify(datas), err => { });

            io.emit('chat message', { user: `${usr.user} ${timestamp}`, msg: usr.msg, id: datas.length });
    }
    });
});



server.listen(3000, () => {
    console.log('socket started listening on 3000');
});
