let currentChatId = '';
let currentContactName = '';
let messages = [];

async function beforeLoad(){
	let account_id = userData.account_id;		//TODO: Debe ser la id del usuario logeado.
	messages = await request(SERVER_URL+`getChat.php`,{account_id:account_id,pair_code:getUrlParams()["id"]})
	fillIterable(document.querySelector(`[foreach="messages"]`),messages)
}

/*
// Datos de ejemplo para diferentes chats
const chatData = {
	'dueno-dargon': {
		name: 'Dueño de Dargón',
		avatar: 'media/dargon.jpg',
		status: 'En línea',
		messages: [
			{
				id: 1,
				text: 'Hola, vi a tu mascota cerca del parque central',
				sent: false,
				time: '14:30',
				status: 'read'
			},
			...
		]
	},
};
*/

// Inicializar chat
function initializeChat() {
	/*
	const params = getUrlParams();
	currentChatId = params.chatId || 'dueno-dargon';
	currentContactName = params.contactName || 'Contacto';
	
	const chatInfo = chatData[currentChatId];
	if (chatInfo) {
		document.getElementById('contactName').textContent = chatInfo.name;
		//document.getElementById('contactStatus').textContent = chatInfo.status;
		document.getElementById('contactAvatar').style.backgroundImage = `url('${chatInfo.avatar}')`;
		messages = [...chatInfo.messages];
	}
	*/
	//renderMessages();
}

// Renderizar mensajes
function renderMessages() {
	const messagesArea = document.getElementById('messagesArea');
	const dateHeader = messagesArea.querySelector('.dateHeader');
	
	// Limpiar mensajes anteriores pero mantener el header de fecha
	const existingMessages = messagesArea.querySelectorAll('.message');
	existingMessages.forEach(msg => msg.remove());
	
	messages.forEach(message => {
		const messageElement = createMessageElement(message);
		messagesArea.appendChild(messageElement);
	});
	
	// Scroll al final
	messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Crear elemento de mensaje
function createMessageElement(message) {
	const messageDiv = document.createElement('div');
	messageDiv.className = `message ${message.sent ? 'sent' : 'received'}`;
	
	let statusHtml = '';
	if (message.sent) {
		let statusIcon = '';
		switch (message.status) {
			case 'sent':
				statusIcon = '✓';
				break;
			case 'delivered':
				statusIcon = '✓✓';
				break;
			case 'read':
				statusIcon = '✓✓';
				break;
		}
		statusHtml = `<div class="messageStatus">${statusIcon}</div>`;
	}
	
	messageDiv.innerHTML = `
		<div>${message.text}</div>
		<div class="messageTime">${message.time}</div>
		${statusHtml}
	`;
	
	return messageDiv;
}

// Enviar mensaje
async function sendMessage() {
	const input = document.getElementById('messageInput');
	const content = input.value.trim();
	
	if (content) {
		const newMessage = {
			content: content,
			inbound: false,
			type: "text",
			timestamp: Math.floor(new Date()/1000),
			//status: 'sent'
		};
		
		messages.push(newMessage);
		input.value = '';
		updateSendButton();
		sendRequest = await request(SERVER_URL+`postChat.php`,
			{...{account_id:account_id,pair_code:getUrlParams()["id"]},
			 ...newMessage})
		if(sendRequest.status=="GOOD"){	//Mostrar mensaje sólo si se pudo enviar correctamente
			document.getElementById("messagesArea").appendChild(newMessageElement(newMessage))
		}
	}
}

// Actualizar estado del botón enviar
function updateSendButton() {
	const input = document.getElementById('messageInput');
	const sendButton = document.getElementById('sendButton');
	sendButton.disabled = !input.value.trim();
}

// Auto-resize del textarea
function autoResize(textarea) {
	textarea.style.height = 'auto';
	textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
	initializeChat();

	const messageInput = document.getElementById('messageInput');
	const sendButton = document.getElementById('sendButton');
	
	// Input de mensaje
	messageInput.addEventListener('input', function() {
		updateSendButton();
		autoResize(this);
	});
	
	// Botón enviar
	sendButton.addEventListener('click', sendMessage);
});

function newMessageElement(data){
	console.log("send:",data)
	let msg = document.createElement("div");
		msg.classList.add("message");
		msg.classList.add(data.inbound?"received":"sent")
	let content = document.createElement("div")
		msg.appendChild(content)
		content.textContent=data.content
	let messageTime = document.createElement("div")
		msg.appendChild(messageTime)
		messageTime.classList.add("messageTime")
		messageTime.textContent=getDateOrTimeString(data.timestamp)
	return msg;
}