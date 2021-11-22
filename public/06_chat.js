console.log("here");
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const users = document.getElementById('users');

var activeChatToken = null;

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

    socket.emit('sendChat', activeChatToken, msg, (cb) => {
        outputMessage(cb);
    });

    evt.target.elements.msg.value = ''; // Clearing input
    evt.target.elements.msg.focus(); 
});


function outputMessage(message) {
    let div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p> <p class="text">${message.text}</p>`
    document.querySelector('.chat-messages').appendChild(div);
}

function loadMessageSection(chatToken) {

    console.log("Clicked chat:", chatToken);
    socket.emit('getChatContents', activeChatToken, chatToken, (chatContent) => {
        document.querySelector('.chat-messages').innerHTML = ''; // Clearing right section
        activeChatToken = chatToken;
        
        for (let index in chatContent) {
            let div = document.createElement('div');

            div.classList.add('message');
            div.innerHTML = `<p class="meta">${chatContent.at(index).sentBy} <span>${chatContent.at(index).timestamp}</span></p> <p class="text">${chatContent.at(index).content}</p>`
            document.querySelector('.chat-messages').appendChild(div);


            // let p = document.createElement('p');
            // p.classList.add('meta')
            // p.innerHTML = `${chatContent.at(index).sentBy} <span>${chatContent.at(index).timeStamp}</span>`
            // div.appendChild(p);

            // let pMessage = document.createElement('p');
            // pMessage.classList.add('text');
            // p.innerText = chatContent.at(index).content;
            // div.appendChild(pMessage);

            // document.querySelector('.chat-messages').appendChild(div);


        }


    });
}

function appendRecentChats(chats) {
    c = chats;
    for (let index in chats) {
        let div = document.createElement('div');
        div.classList.add('individual-chats');

        let pChattingWith = document.createElement('p');
        pChattingWith.classList.add('chatting-with');
        pChattingWith.innerText = chats.at(index).chattingWith;
        div.appendChild(pChattingWith);

        let pListingTitle = document.createElement('p');
        pListingTitle.classList.add('listing-title');
        pListingTitle.innerText = chats.at(index).listingTitle;
        div.appendChild(pListingTitle);

        users.appendChild(div);
        div.addEventListener('click', () => {
            loadMessageSection(chats.at(index).chatToken);
        });



    }
}

window.onload = (event) => {
    socket.emit('getRecentChats', (recentChats) => {
        appendRecentChats(recentChats);
        
    });
    console.log("LOADED");
}