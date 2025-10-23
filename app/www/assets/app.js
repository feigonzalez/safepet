window.addEventListener("load",()=>{
	processContents();
})

async function processContents(self){
	if(typeof beforeLoad === "function")
		await beforeLoad();
	let frame = self;
	if(!self) frame = document.body;
	
	// Repite el contenido de elementos con [foreach] por cada entrada del objeto
	// señalado en el atributo.
	for(let iterator of frame.querySelectorAll("[foreach]")){
		let data = eval(iterator.getAttribute("foreach"));
		let lastEntry=iterator;
		for(let item of data){
			let newEntry = iterator.cloneNode(true);
			for(let key in item){
				newEntry.innerHTML=newEntry.innerHTML.replaceAll("${"+key+"}",item[key])
			}
			lastEntry.after(newEntry)
			lastEntry=newEntry;
		}
		iterator.remove()
	}
	
	// Reemplaza el contenido de texto ${X} por el resultado de eval(X)
	for(let toReplace of [...frame.innerHTML.matchAll(/\${(.*?)}/g)]){
		try{
			frame.innerHTML = frame.innerHTML.replaceAll(toReplace[0],eval(toReplace[1]));
		} catch(e){
			
		}
	}
	
	// Borra los campos de templating (de formato ${...}) que quedaron sin reemplazar.
	frame.innerHTML=frame.innerHTML.replaceAll(/\${(.*?)}/gm,"");
	
	for(let hasContent of frame.querySelectorAll("[content]")){
		hasContent.innerHTML=hasContent.getAttribute("content");
	}
	
	// Fija el [placeholder] los inputs de tipo texto a " " para las animaciones css
	for(let input of frame.querySelectorAll("input[type=text]")){
		if(input.getAttribute("placeholder") == null){
			input.setAttribute("placeholder"," ")
		}
	}
	
	// Maneja elementos que no son <img> pero que muestran imágenes
	for(let pseudoImg of frame.querySelectorAll("[data-imgsrc]")){
		pseudoImg.style.backgroundImage="url("+pseudoImg.dataset.imgsrc+")";
	}
	
	// Fija la imagen de fondo para los elementos con [data-icon]
	for(let icon of frame.querySelectorAll("[data-icon]")){
		icon.style.backgroundImage="url(\"assets/"+icon.dataset.icon+".svg\")";
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
	
	// Hace que el botón #backButton redirija a la página previa
	let backButton = frame.querySelector("#backButton")
	if(backButton){
		backButton.addEventListener("click",()=>{
			// Si hay historial previo, retrocede
			if(window.history.length > 1){
				history.back();
			} else {
				// Si no hay historial, va a la página principal
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
}

function showUploadedImage(src,target){
	const file = src.files[0];
	if(file){
		document.querySelector("#"+target).src = URL.createObjectURL(file)
	}
}

function showUploadedImageAsBg(src,target){
	const file = src.files[0];
	if(file){
		document.querySelector("#"+target).style.backgroundImage = "url("+URL.createObjectURL(file)+")"
	}
}
/*
	Closes a modal. This assumes there's a single modal open.
*/
function closeModal(){
	let modal = document.querySelector(".modalBackdrop");
	if(modal) modal.remove()
}

function loadModal(url){
	let modal = document.createElement("div");
	modal.className="modalBackdrop";
	modal.innerHTML=`<div class="modalBody"><div class="modalCloseButton" onclick="closeModal()"></div><div class="modalContent" id="modalContent"></div></div>`;
	document.body.appendChild(modal);
	fetch(url).then(r=>r.text()).then(html=>{
		document.getElementById("modalContent").innerHTML=html;
		processContents(document.getElementById("modalContent"));
	});
}

// Función para mostrar opciones de foto
function showPhotoOptions() {
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
                            <button class="button bg-red" id="takePhotoBtn">
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
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modalBackdrop';
        modal.innerHTML = `
            <div class="verification-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="button-group">
                    <button class="button" id="cancelVerificationBtn">${cancelText}</button>
                    <button class="button bg-red" id="confirmVerificationBtn">${confirmText}</button>
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