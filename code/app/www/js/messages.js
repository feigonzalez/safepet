var messages;

let account_id = deviceIDToUID();

async function beforeLoad(){
	if(userData.account_id) account_id=userData.account_id;
	let response = await request(SERVER_URL+"getLatestChats.php",{"account_id":account_id})
	if(response.status=="MISS"){
		document.querySelector("#messagesList .card").innerHTML="No tienes conversaciones activas";
	} else {
		messages=response.messages;
		for(let m of messages){
			m.recency = getRecency(m.timestamp);
			switch(m.type){
				case "geo": m.content="<span class='icon' data-icon='location'></span> Ubicación"; break;
				case "init":
				case "text":
				default:
					break;
			}
			m.partnerImg="";
			if(m.partner==null)
				m.partner = "Usuario sin cuenta";
		}
		fillIterable(document.querySelector("[foreach=messages]"),messages)
		
		for(let header of document.querySelectorAll(".chatHeader")){
			header.querySelector(".msgAvatar").style.filter="hue-rotate("+(-10*(parseInt(hash(header.textContent),36)%12))+"deg)";
		}
		//Actualiza la recencia (qué tan reciente es) de los mensajes de la lista
		setInterval(()=>{
			for(let timestamp of document.querySelectorAll(".timestamp")){
				timestamp.textContent=getRecency(parseInt(timestamp.dataset.time));
			}
		},15000)
	}
}