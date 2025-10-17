window.addEventListener("load",()=>{
	processContents();
	
	// Manejo del botón 'Volver' de Android
	document.addEventListener('backbutton', function(e) {
		// Si hay un modal abierto, cerrarlo
		let modal = document.querySelector(".modalBackdrop");
		if(modal) {
			modal.remove();
			e.preventDefault();
			return;
		}
		
		// Si estamos en la página principal (index.html), cerrar la aplicación
		if(window.location.pathname.includes('index.html') || window.location.pathname === '/') {
			navigator.app.exitApp();
		} else {
			// En otras páginas, comportamiento normal de retroceso
			if(window.history.length > 1){
				history.back();
			} else {
				window.location.href = 'index.html';
			}
		}
	}, false);
})

async function processContents(self){
	if(typeof beforeLoad === "function")
		await beforeLoad();
	let frame = self;
	if(!self) frame = document.body;
	
	// Repite el contenido de elementos con [foreach] por cada entrada del objeto
	// señalado en el atributo.
	for(let iterator of frame.querySelectorAll("[foreach]")){
		data = eval(iterator.getAttribute("foreach"));
		template = iterator.innerHTML;
		iterator.innerHTML="";
		for(let item of data){
			let newEntry = template;
			for(let key in item){
				newEntry=newEntry.replaceAll("${"+key+"}",item[key])
			}
			iterator.innerHTML+=newEntry
		}
	}
	
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
	
	// Borra los campos de templating (de formato ${...}) que quedaron sin reemplazar.
	frame.innerHTML=frame.innerHTML.replaceAll(/\${(.*?)}/gm,"");
	
	// Hace que el botón #backButton redirija a la página previa
	let backButton = frame.querySelector("#backButton")
	if(backButton){
		console.log(backButton)
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
	let modalBackdrop = document.createElement("div")
		modalBackdrop.classList.add("modalBackdrop")
		document.body.appendChild(modalBackdrop)
	let modalBody = document.createElement("div")
		modalBody.classList.add("modalBody")
	let modalCloseButton = document.createElement("div")
		modalCloseButton.classList.add("modalCloseButton")
		modalCloseButton.setAttribute("title", "Cerrar modal")
		modalCloseButton.setAttribute("role", "button")
		modalCloseButton.setAttribute("tabindex", "0")
		modalCloseButton.addEventListener("click",(e)=>{
			e.preventDefault();
			e.stopPropagation();
			closeModal();
		})
		modalBody.appendChild(modalCloseButton)
	let modalContent = document.createElement("div")
		modalContent.classList.add("modalContent")
		modalBody.appendChild(modalContent)
	fetch(url).then(r=>r.ok?r.text():"").then(t=>{
		modalContent.innerHTML=t;
		/*Se añade el modal al final para que no se muestre antes de cargar el contenido*/
		modalBackdrop.appendChild(modalBody)
		processContents(modalBackdrop)
	})
}