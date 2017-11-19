var express = require('express');
var app = express();
var io = require('socket.io').listen(app.listen(8080));

app.set('views', __dirname + '/tpl'); // расположение шаблонов 
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public')); // расположение статики

app.get('/', function(req, res) {
    res.render('index.jade');
});

var COLORS = [
'#e21400', '#91580f', '#f8a700', '#f78b00',
'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];
var users = {}; //объект всех юзеров
var num_users = 0; //количество юзеров


io.sockets.on('connection', function(client) {
    
    // обработка нового юзера
    client.on('new_user', function(data) {
        
        var index = Math.floor(Math.random(0,COLORS.length)*10);
        var rand_color = COLORS[index];
        var new_user = {name: data.name, color: rand_color};
        users[client.id] = new_user;
        num_users = Object.keys(users).length;
        
        client.emit('response_to_new_user', { 
                                              "new_user": new_user,
                                              "user_id": client.id,
                                              "other_user": users,
                                              "num_users": num_users
                                            });
        
        client.broadcast.emit('response_to_other_user', { 
                                                          "new_user": new_user,
                                                          "user_id": client.id,
                                                          "num_users": num_users
                                                        });
        
    });
    
    // обработка сообщений
    client.on('message', function(data) {
        io.sockets.emit('response_message', {
                                              "message": data.message,
                                              "user_id": client.id
                                            });
    });
    
    // обраотка события набора сообщения
    client.on('typing', function(data) {
        client.broadcast.emit('response_typing', { "user_id": client.id });
    });

    // обработка удаленного юзера
    client.on('disconnect', function() {
        if (num_users > 1) {
            --num_users;
            client.broadcast.emit('response_disconnect', { 
                                                           "user_id": client.id,
                                                           "num_users": num_users
                                                         });
        };
        delete users[client.id];
    });
    
});