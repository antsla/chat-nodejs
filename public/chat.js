var socket;
var users = {};
var typing = false;
var typingFadeTime = 1000;

window.onload = function() {
    socket = io.connect('http://localhost:8080');
    
    var text_field = $('#text');
    
    $('#regUser').submit(function() {
        var name = $('#enterName').val();
        if (name) {
            socket.emit('new_user', {name: name});
            $('#regUser').fadeOut(1000);
        }
    });
    
    $('#form').submit(function() {
        var text = text_field.val().trim();
        if (text) {
            socket.emit('message', { "message": text });
            text_field.val('');
        }
    });
    
    // событие ввода в инпут сообщения
    text_field.on('input', function() {
        if (!typing) {
            typing = true;
            socket.emit('typing');
        }
        setTimeout(function() {
            typing = false;
        }, typingFadeTime);
        
    });
    
    socket.on('response_to_new_user', function(data) {
        if (data) {
            users = data.other_user;
            users[data.user_id] = data.new_user;
            $('#content').append('<div class="join">Вы присоединились к чату!</div>');
            $('#content').append('<div class="join">Всего участников в чате: ' + data.num_users + '</div>');
            scrollBottom();
        } else {
            console.log('Ошибка!');
        }
    });
    
    socket.on('response_to_other_user', function(data) {
        if (users) {
            users[data.user_id] = data.new_user;
            $('#content').append('<div class="join"><b style="color: ' + users[data.user_id].color + ';">' + users[data.user_id].name + '</b> присоединился к чату</div>');
            $('#content').append('<div class="join">Всего участников в чате: ' + data.num_users + '</div>');
            scrollBottom();
        } else {
            console.log('Ошибка!');
        }
    });
    
    socket.on('response_message', function(data) {
        if (data) {
            $('#content').append('<li class="message left appeared"><div class="text_wrapper"><b style="color: ' + users[data.user_id].color + ';">' + users[data.user_id].name + ':</b> ' + data.message + '</div></li>');
            scrollBottom();
        } else {
            console.log('Ошибка!');
        }
    });
    
    socket.on('response_typing', function(data) {
        if (data) {
            $('#'+data.user_id).remove();
            $('<li id="' + data.user_id + '" class="message left appeared"><div class="text_wrapper"><b style="color: ' + users[data.user_id].color + ';">' + users[data.user_id].name + '</b> набирает сообщение...</div></li>').hide().appendTo("#content").fadeIn(typingFadeTime);
            scrollBottom();
            $('#'+data.user_id).fadeOut(typingFadeTime, function() {
                $(this).remove();
            });
        } else {
            console.log('Ошибка!');
        }
    });
    
    socket.on('response_disconnect', function(data) {
        if (data) {
            $('#content').append('<div class="join"><b style="color: ' + users[data.user_id].color + ';">' + users[data.user_id].name + '</b> покинул чат</div>');
            $('#content').append('<div class="join">Осталось участников в чате: ' + data.num_users + '</div>');
            delete users[data.user_id];
            scrollBottom();
        } else {
            console.log('Ошибка!');
        }
    });
    
};

window.onunload = function () {
    socket.disconnect();
};

function scrollBottom() {
    var block = document.getElementById("content");
    block.scrollTop = block.scrollHeight;
}
