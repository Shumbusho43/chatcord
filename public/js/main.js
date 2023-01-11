//getting chat form
const chartForm=document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
//get username and Room from URL
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});
const socket = io();
socket.on('message', message => {
    chatMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
}
)
const roomName=document.getElementById('room-name');
function outputRoomName(room){
    roomName.innerText=room;
}
const userList=document.getElementById('users');
function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
}
//sending username and room to the server
socket.emit('joinRoom',{username,room});
//getting message value

chartForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg=e.target.elements.msg.value;
//emit message to the server
    socket.emit('chatMessage',msg);
//clear input
e.target.elements.msg.value='';
e.target.elements.msg.focus();
})

//chatMessage function
const chatMessage=(message)=>{
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML=`<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
