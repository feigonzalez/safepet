//Chile - Español
const LOCALE = "cl-ES";
// "es" es para "espa?ol" TODO: Si se quisiera i18nalizar habria que cambiarlo
const timeFormat = new Intl.RelativeTimeFormat("es",{style:"short"})
// almacena la informaci��n del usuario. Se obtiene directamente desde localStorage
var userData={};
// es TRUE entre que se hace un request para obtener las notificaciones y que se recibe la respuesta
var fetchingNotifications=false;

window.addEventListener("load",()=>{
	locate((pos)=>{
		localStorage.setItem("latitude",pos.coords.latitude)
		localStorage.setItem("longitude",pos.coords.longitude)
	})
	try{ 
		userData = JSON.parse(localStorage.getItem("userData")) 
		userData.firstName = userData.name.split(" ")[0]
	}
	catch(e) {userData = {}}
	if(typeof beforeLoad === "function")
		beforeLoad();
	// Repite el contenido de elementos con [foreach] pero sin [await]
	// por cada entrada del objeto señalado en el atributo.
	for(let iterable of document.querySelectorAll("[foreach]:not([await])")){
		let data = eval(iterable.getAttribute("foreach"));
		fillIterable(iterable,data)
	}
	processContents();

    // Procesar Flow solo si hay parámetros y en páginas destino de la app (evitar verify/validate)
    try{
        const qp = new URLSearchParams(window.location.search);
        const page = window.location.pathname.split('/').pop();
        if ((qp.get('flowReturn') === '1' || qp.has('token') || qp.has('order')) && (page === 'account.html' || page === 'subscription.html')){
            procesarFlow();
        }
    }catch(_){ }
	
	// si la sesi��n est�� iniciada, se crea un intervalo para buscar notificaciones nuevas cada 15 segundos
	if(userData.account_id){
		notificationCheckInterval = setInterval(async ()=>{
			if(fetchingNotifications){
				console.log("still fetching notifications");
				return;
			} else {
				let lastTimestamp = localStorage.lastNotificationTimestamp || 0;
				console.log(`fetching notifications [time:${lastTimestamp}]`);
				fetchingNotifications=true;
				let req = await request(SERVER_URL+"pullNotifications.php",{account_id:userData.account_id,timestamp:lastTimestamp})
				if(req.status!="MISS"){
					notifications = req.notifications;
					for(notification of notifications){
						if(parseInt(notification.timestamp)>lastTimestamp){
							lastTimestamp=parseInt(notification.timestamp);
						}
						showNotification(notification.title,notification.description,new Date(Date.now()+100));
					}
				}
				localStorage.setItem("lastNotificationTimestamp",lastTimestamp);
				fetchingNotifications=false;
				console.log("done fetching notifications");
			}
		},
		// 15000 milisegundos (15 segundos)
		15000)
	}
})

function replaceContents(self,data){
	let frame = self;
	if(!self) frame = document.body;
    for(let attrName of frame.getAttributeNames()){
        for(let toReplace of [...frame.getAttribute(attrName).matchAll(/\${(.*?)}/g)]){
            let newValue = "";
            if(toReplace[1] in data) {
                newValue = data[toReplace[1]];
            } else {
                try {
                    newValue = eval(toReplace[1]);
                } catch(e) {
                    console.error(e);
                    newValue = "";
                }
            }
            frame.setAttribute(attrName,frame.getAttribute(attrName).replaceAll(toReplace[0],newValue))
        }
    }
	for(let key in data){
		frame.innerHTML=frame.innerHTML.replaceAll("${"+key+"}",data[key])
	}
	for(let toReplace of [...frame.innerHTML.matchAll(/\${(.*?)}/g)]){
		try{
			let newValue=eval(toReplace[1]);
			frame.innerHTML = frame.innerHTML.replaceAll(toReplace[0],newValue);
		} catch(e){
			console.error(e)
		}
	}
	for(let hasContent of frame.querySelectorAll("[content]")){
		hasContent.innerHTML=hasContent.getAttribute("content");
		hasContent.removeAttribute("content");
	}
}

function fillIterable(iterable,data){
	let lastEntry=iterable;
	for(let item of data){
		let newEntry = iterable.cloneNode(true);
		lastEntry.after(newEntry)
		newEntry.removeAttribute("foreach");
		newEntry.removeAttribute("await");
		replaceContents(newEntry,item)
		processContents(newEntry)
		lastEntry=newEntry;
	}
	iterable.remove()
}

function getRecency(timestamp){
	let timescale="second";
	let recency = timestamp - (Date.now()/1000)
	if(Math.abs(recency)>60){
		recency/=60; timescale="minute";
		if(Math.abs(recency)>60){
			recency/=60; timescale="hour";
			if(Math.abs(recency)>24){
				recency/=24; timescale="day";
			}
		}
	}
	return timeFormat.format(Math.floor(recency),timescale)
}

function getDateOrTimeString(timestamp){
	let today = new Date().toLocaleDateString(LOCALE);
	let thatDate = new Date(timestamp*1000);
	if(thatDate.toLocaleDateString(LOCALE) == today){
		return thatDate.toLocaleTimeString(LOCALE)
	} else {
		return thatDate.toLocaleString(LOCALE);
	}
}

function setIcon(element, icon){
	element.dataset.icon = icon;
	updateIcon(element)
}
function updateIcon(icon){
	icon.style.backgroundImage="url(\"icons/"+icon.dataset.icon+".svg\")";
}

async function processContents(self){
	let frame = self;
	if(!self) frame = document.body;
	
	// Borra los campos de templating (de formato ${...}) que quedaron sin reemplazar.
	//frame.innerHTML=frame.innerHTML.replaceAll(/\${(.*?)}/gm,"");
	
	for(let optional of frame.querySelectorAll("[if]")){
		console.log(`verifying [${optional.getAttribute("if")}]`)
		if(!eval(optional.getAttribute("if"))) optional.remove()
	}
	
	// Fija el [placeholder] los inputs de tipo texto a " " para las animaciones css
	for(let input of frame.querySelectorAll("input[type=text]")){
		if(input.getAttribute("placeholder") == null){
			input.setAttribute("placeholder"," ")
		}
	}
	
	// Maneja elementos que no son <img> pero que muestran imágenes
	for(let pseudoImg of frame.querySelectorAll("[data-imgsrc]")){
		if(pseudoImg.dataset.imgsrc.trim() != "" )pseudoImg.style.backgroundImage="url("+pseudoImg.dataset.imgsrc+")";
	}
	
	// Fija la imagen de fondo para los elementos con [data-icon]
	for(let icon of frame.querySelectorAll("[data-icon]")){
		updateIcon(icon);
	}
	
	// Maneja los elementos de grilla:
	// Usa el valor [data-columns] para determinar el número de columnas.
	// Elementos con [colspan=X] dentro de un .grid abarcan X columnas.
	for(let grid of frame.querySelectorAll(".grid")){
		if(grid.dataset["columns"]){
			grid.style.gridTemplateColumns="repeat("+grid.dataset["columns"]+", 1fr)";
		}
	}
	for(let span of frame.querySelectorAll(".grid [colspan]")){
		span.style.gridColumn=span.getAttribute("colspan")+" span";
	}
	
    // Botón Volver unificado
    let backButton = frame.querySelector("#backButton")
    if(backButton){
        backButton.addEventListener("click",()=>{
            try{
                if (window.NavigationUtils && typeof window.NavigationUtils.goBack === 'function'){
                    window.NavigationUtils.goBack();
                } else {
                    window.location.href = 'index.html';
                }
            } catch(_) {
                window.location.href = 'index.html';
            }
        })
    }
	
	// Something about handling file uploads ??
	for(let controller of frame.querySelectorAll(".fileUploadControl")){
		controller.addEventListener("click",()=>{
			frame.querySelector("#"+controller.dataset.input).click()
		})
	}
	
	for(let replacer of document.querySelectorAll("a[replace]")){
		replacer.onclick=(ev)=>{
			ev.preventDefault();
			window.location.replace(replacer.getAttribute("href"));
		}
	}
}

function showUploadedImage(src,target){
	const file = src.files[0];
	if(file){
		document.querySelector("#"+target).src = URL.createObjectURL(file)
	}
}

// Cierra el modal.
// No hay ninguna razón para que haya más de un modal a la vez
function closeModal(el){
	let modal = document.querySelector('.modalBackdrop');
	if (modal){
		if(modal.onclose) modal.onclose();
		modal.remove();
	}
}

function closePopUp(){
	let popUp = document.querySelector('.popUpBackdrop');
	if (popUp){
		if(popUp.onclose) popUp.onclose();
		popUp.remove();
	}
}

// Carga el contenido de un archivo html y lo muestra en un modal
// Si se pasa una función como closeCallback, esa función se llamará al cerrar el modal (usando closeModal())
// Esto se usa para redigirir a otras vistas, por ejemplo
function loadModal(url,closeCallback){
	closeModal();
	let modal = document.createElement("div");
	modal.classList.add("modalBackdrop");
	if(closeCallback) modal.onclose=closeCallback;
	modal.innerHTML=`<div class="modalBody"><div class="modalCloseButton" onclick="closeModal()"></div><div class="modalContent" id="modalContent"></div></div>`;
	document.body.appendChild(modal);
	modal.querySelector(".modalCloseButton").addEventListener("click",()=>{ closeModal(); })
	fetch(url).then(r=>r.text()).then(html=>{
		let modalContent = document.getElementById("modalContent")
		modalContent.innerHTML=html;
		processContents(modalContent);
	});
}

function popUpMenu(options){
	const modal = document.createElement('div');
	modal.className = 'popUpBackdrop';
	modal.addEventListener("click",closePopUp)
	modal.innerHTML = `
		<div class="popUpBody">
			<div class="popUpContent">
				<div class="row">
					<div id="popUpOptions" class="column">
					</div>
				</div>
			</div>
		</div>
	`;
	document.body.appendChild(modal);
	let optionsHolder = document.querySelector("#popUpOptions");
	let index = 0;
	for(let o in options){
		if(options[o]==null)continue;
		let oE = document.createElement("button")
		oE.id = "popUpOption_"+index;
		oE.classList.add("popUpOption");
		oE.textContent=o;
		oE.onclick=options[o];
		optionsHolder.appendChild(oE);
		index++;
	}
}

// Función para mostrar opciones de foto
function showPhotoOptions() {
	closeModal();
    return new Promise((resolve, reject) => {
        const modal = document.createElement('div');
        modal.className = 'modalBackdrop';
        modal.innerHTML = `
            <div class="modal">
                <div class="column mh-1">
                    <div class="row ta-center">
                        <h2 style="margin:0.5rem 0">Seleccionar Foto</h2>
                        <p class="metaText" style="margin:0.5rem 1rem">¿Cómo quieres agregar la foto de tu mascota?</p>
                    </div>
                    <div class="row compact">
                        <div class="column">
                            <button class="button bg-primary" id="takePhotoBtn">
                                <span class="icon" data-icon="camera"></span>
                                &nbsp;&nbsp;Tomar Foto
                            </button>
                            <button class="button" id="selectPhotoBtn">
                                <span class="icon" data-icon="image"></span>
                                &nbsp;&nbsp;Seleccionar de Galería
                            </button>
                            <button class="button" id="cancelPhotoBtn">
                                <span class="icon" data-icon="x"></span>
                                &nbsp;&nbsp;Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#takePhotoBtn').addEventListener('click', async () => {
            try {
                await CameraManager.capturePhoto('reg_petImage', 'petImageDisplay');
                modal.remove();
                resolve('camera');
            } catch (error) {
                modal.remove();
                reject(error);
            }
        });

        modal.querySelector('#selectPhotoBtn').addEventListener('click', () => {
            document.getElementById('reg_petImage').click();
            modal.remove();
            resolve('gallery');
        });

        modal.querySelector('#cancelPhotoBtn').addEventListener('click', () => {
            modal.remove();
            reject(new Error('Operación cancelada por el usuario'));
        });
    });
}

// Función para mostrar modal de verificación
function showVerificationModal(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
	closeModal();
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modalBackdrop';
        modal.innerHTML = `
            <div class="modalBody">
				<div class="modalContent">
					<div class="row"><h3>${title}</h3></div>
					<div class="row ta-center"><p>${message}</p></div>
					<div class="row">
						<div class="column">
							<button class="row" id="cancelVerificationBtn">${cancelText}</button>
							<button class="row bg-primary" id="confirmVerificationBtn">${confirmText}</button>
						</div>
					</div>
				</div>
			</div>
		`;

        document.body.appendChild(modal);

        modal.querySelector('#confirmVerificationBtn').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });

        modal.querySelector('#cancelVerificationBtn').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
    });
}
// Función para mostrar modal de espera. 
async function showAwaitModal(title, message, awaiting = async ()=>{}, onResolve = ()=>{}) {
	closeModal();
	const modal = document.createElement('div');
	modal.className = 'modalBackdrop';
	modal.innerHTML = `
		<div class="modalBody">
			<div class="modalContent">
				<div class="row ta-center"><h3 id="modalTitle">${title}</h3></div>
				<div class="row ta-center">${message}</div>
				<div class="row"><span class="icon throbber" data-icon="progress-activity"></div>
			</div>
		</div>
	`;
	processContents(modal)
	document.body.appendChild(modal);
	await awaiting().then(onResolve)
}

// Función para mostrar modal de verificación, versión síncrona
function showAlertModal(title, message, onConfirm = ()=>{}, onCancel = ()=>{}) {
	closeModal();
	const modal = document.createElement('div');
	modal.className = 'modalBackdrop';
	modal.innerHTML = `
		<div class="modalBody">
			<div class="modalContent">
				<div class="row ta-center"><h3>${title}</h3></div>
				<div class="row ta-center">${message}</div>
				<div class="row">
					<button id="confirmAlertBtn" class="button column bg-primary" onclick="closeModal()">Entendido</button>
				</div>
			</div>
		</div>
	`;
	processContents(modal)
	document.body.appendChild(modal);
	modal.querySelector("#confirmAlertBtn").addEventListener("click",onConfirm);
}

// Función para mostrar modal de confirmación. Parecido al de verificación, pero usa funciones de callback en vez de promesas
function showConfirmModal(title, message, onConfirm = ()=>{}, onCancel = ()=>{}) {
	closeModal();
	const modal = document.createElement('div');
	modal.className = 'modalBackdrop';
	modal.innerHTML = `
		<div class="modalBody">
			<div class="modalContent">
				<div class="row ta-center"><h3>${title}</h3></div>
				<div class="row ta-center"><p>${message}</p></div>
				<div class="row">
					<button class="button column" id="cancelVerificationBtn">Cancelar</button>
					<button class="button column bg-primary" id="confirmVerificationBtn">Confirmar</button>
				</div>
			</div>
		</div>
	`;
	document.body.appendChild(modal);

	modal.querySelector('#confirmVerificationBtn').addEventListener('click', () => {
		onConfirm();
		modal.remove();
	});

	modal.querySelector('#cancelVerificationBtn').addEventListener('click', () => {
		onCancel();
		modal.remove();
	});
}

// Mejorar la función showUploadedImageAsBg para trabajar con el círculo
function showUploadedImageAsBg(src, target) {
    const targetElement = document.getElementById(target);
    if (src.files && src.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            targetElement.style.backgroundImage = `url(${e.target.result})`;
            targetElement.classList.add('has-image');
        };
        reader.readAsDataURL(src.files[0]);
    }
	/*
	const file = src.files[0];
	if(file){
		document.querySelector("#"+target).style.backgroundImage = "url("+URL.createObjectURL(file)+")"
	}
	*/
}

// Función específica para escanear QR en registro
async function scanQRForRegistration() {
    try {
        const confirmed = await showVerificationModal(
            'Escanear Código QR',
            '¿Estás seguro de que quieres escanear el código QR? Esto puede completar automáticamente algunos campos del formulario.',
            'Escanear',
            'Cancelar'
        );
        
        if (confirmed) {
            const qrContent = await CameraManager.scanQRCode();
            if (qrContent) {
                // Procesar el contenido del QR y llenar campos automáticamente
                processQRContent(qrContent);
            }
        }
    } catch (error) {
        console.error('Error al escanear QR:', error);
        alert('Error al escanear QR: ' + error.message);
    }
}

// Función para procesar contenido QR y llenar formulario
function processQRContent(qrContent) {
    try {
        // Intentar parsear como JSON
        const data = JSON.parse(qrContent);
        
        // Llenar campos si existen en el QR
        if (data.species) document.getElementById('rep_petSpecies').value = data.species;
        if (data.breed) document.getElementById('rep_petBreed').value = data.breed;
        if (data.color) document.getElementById('rep_petColor').value = data.color;
        if (data.sex) {
            if (data.sex.toLowerCase() === 'm' || data.sex.toLowerCase() === 'macho') {
                document.getElementById('rep_petSexM').checked = true;
            } else if (data.sex.toLowerCase() === 'f' || data.sex.toLowerCase() === 'hembra') {
                document.getElementById('rep_petSexF').checked = true;
            }
        }
        
        alert('Datos del QR cargados automáticamente. Revisa y completa la información faltante.');
    } catch (e) {
        // Si no es JSON, mostrar el contenido como texto
        alert(`Código QR detectado: ${qrContent}\n\nPor favor, completa manualmente los datos del formulario.`);
    }
}

const hash = function(str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
	h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1>>>0)).toString(36);
};

async function locate(callbackSuccess, callbackError = ()=>{}){
	if(!navigator.geolocation){
		console.warn("Este navegador no permite geolocalización")
		try{ if(typeof callbackError === 'function') callbackError(); }catch(_){}
	}
	navigator.geolocation.getCurrentPosition(
		(pos)=>{	//On Success
			localStorage.setItem("latitude",pos.coords.latitude)
			localStorage.setItem("longitude",pos.coords.longitude)
			callbackSuccess(pos);
		},
		(e)=>{	//On Error
			console.warn("No se pudo obtener geolocalización")
			try{ if(typeof callbackError === 'function') callbackError(e); }catch(_){}
		}
	)
}

// Formula de Haversine, o del semiverseno: https://www.movable-type.co.uk/scripts/latlong.html
// Entrega la distancia, en metros, entre dos puntos de la Tierra, dados por sus latitudes y longitudes
function distanceGeo(lat1, lon1, lat2, lon2){
	const R = 6371e3; // Radius of Earth, in meters
	const d1 = lat1 * Math.PI/180; // φ, λ in radians
	const d2 = lat2 * Math.PI/180;
	const Dd = (lat2-lat1) * Math.PI/180;
	const Dl = (lon2-lon1) * Math.PI/180;

	const a = Math.sin(Dd/2) * Math.sin(Dd/2) +
			Math.cos(d1) * Math.cos(d2) *
			Math.sin(Dl/2) * Math.sin(Dl/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	const d = R * c; // in metres
	return d;
}

// Uses a QRServer API to generate a qr code.
function getQR(data){
	return "https://api.qrserver.com/v1/create-qr-code/?data="+data;
}

function getAnimalClass(s){
	switch(s.trim().toLowerCase()){
		case "perro": return "dog";
		case "gato":  return "cat";
		case "loro":
		case "cata":
		case "gorrion":
		case "cuervo": return "bird";
		default: return "pet";
	}
}

// Retorna un número "único" para el dispositivo.
// Se usa como ID de usuario para manejar mensajería con usuarios no registrados
function deviceIDToUID(){
	let id = localStorage.deviceID.replaceAll("-","")
	return Math.floor(parseInt(id.substring(id.length-8),16)*-0.5)
}