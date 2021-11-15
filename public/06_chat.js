console.log("here");
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

// Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message);

    // Scroll down to most recent message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});


// Send message
chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    let msg = evt.target.elements.msg.value;

    // Sending message to server
    socket.emit('chatMessage', msg);
    socket.emit('login', "hellologin");

    evt.target.elements.msg.value = ''; // Clearing input
    evt.target.elements.msg.focus(); 
});


function outputMessage(message) {
    let div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p> <p class="text">${message.text}</p>`
    document.querySelector('.chat-messages').appendChild(div);
}

window.onload = (event) => {
    socket.emit('fetch-messages', (messageUsers) => {
        console.log("CB:", messageUsers);
    });
    console.log("LOADED");
}