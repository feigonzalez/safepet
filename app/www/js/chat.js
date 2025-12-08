let currentChatId = '';
let currentContactName = '';
let messages = [];
let lastTimestamp = 0;
let refreshInterval = 0;

let account_id = deviceIDToUID();

const chatMenu={
	"Eliminar Conversación":confirmDeleteChat
}

function confirmDeleteChat(){
	showConfirmModal(
		"¿Eliminar Conversción?",
		"Se eliminará para ambas personas y no podrán volver a ponerse en contacto hasta que se haga un nuevo reporte",
		deleteChat
	)
}

function deleteChat(){
	showAwaitModal("Eliminando conversación","",
	async ()=>{ return request(SERVER_URL+"deleteChat.php",{pair_code:URLparams["id"],account_id:account_id});},
	(req)=>{
		if(req.status=="GOOD")
			showAlertModal("Conversación Eliminada","Volverás a la lista de conversaciones",goBack);
		else
			showAlertModal("Hubo un error","La conversación no pudo ser eliminada");
	})
}

async function beforeLoad(){
	if(userData.account_id) account_id=userData.account_id;
	let startingMessages = await getNewerMessages();
	refreshInterval = setInterval(getNewerMessages,15000);
	if(startingMessages.pairName==null)
		startingMessages.pairName="Usuario sin cuenta";
	document.querySelector("#contactName").textContent=startingMessages.pairName;
	document.querySelector(".profileImageDisplay").style.filter="hue-rotate("+(-10*(parseInt(hash(startingMessages.pairName),36)%12))+"deg)";
}

async function getNewerMessages(){
	let messagesContainer = document.querySelector("#messagesArea");
	let newMessages = await request(SERVER_URL+`getChat.php`,{account_id:account_id, pair_code:getUrlParams()["id"], timestamp:lastTimestamp})
	if(newMessages.status=="GOOD"){
		for(let message of newMessages.messages){
			let newMessage = newMessageElement(message)
			messagesContainer.appendChild(newMessage);
			messages.push(message)
		}
		lastTimestamp = messages[messages.length-1].timestamp;
	}
	return newMessages;
}

function newMessageElement(data){
	console.log("send:",data)
	let msg = document.createElement("div");
		msg.classList.add("message");
		msg.classList.add(data.type)
		msg.classList.add(data.inbound?"received":"sent")
	let content = document.createElement("div")
		msg.appendChild(content)
	switch(data.type){
		case "init":
			break;
		case "geo":
			content.innerHTML=`<span class="icon" data-icon="location"></span> <small>Toca para ver en el mapa</small>`
			content.addEventListener("click",()=>{
				const loc = data.content.split(";");
				console.log(loc)
				navigateTo(`index.html?marker=report;${loc[0]};${loc[1]}`);
			})
			break;
		case "text":
			content.textContent=data.content
			break;
		default:
			console.log("unknown message type:",data.type)
			msg.appendChild(content)
			content.textContent=data.content
			break;
	}
	processContents(content)
	let messageTime = document.createElement("div")
		msg.appendChild(messageTime)
		messageTime.classList.add("messageTime")
		messageTime.textContent=getDateOrTimeString(data.timestamp)
	return msg;
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
			{account_id:account_id,pair_code:getUrlParams()["id"],...newMessage})
		// Solicita los mensajes nuevos. Si el mensaje se envió correctamente, se debería mostrar como el último de la conversación
		getNewerMessages();
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