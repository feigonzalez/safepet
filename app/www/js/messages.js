var messages;
async function beforeLoad(){
	if(!userData.account_id){
		document.querySelector("#messagesList").innerHTML=`
			<div class="row ta-center">
			<p>Cuando hagas un reporte de mascota perdida, el dueño de la mascota podrá ponerse en contacto contigo.</p>
			</div>`;
	} else {
		let response = await request(SERVER_URL+"getLatestChats.php",{"account_id":userData.account_id})
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
			}
			fillIterable(document.querySelector("[foreach=messages]"),messages)
			
			//Actualiza la recencia (qué tan reciente es) de los mensajes de la lista
			setInterval(()=>{
				for(let timestamp of document.querySelectorAll(".timestamp")){
					timestamp.textContent=getRecency(parseInt(timestamp.dataset.time));
				}
			},15000)
		}
	}
}