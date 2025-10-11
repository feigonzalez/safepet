window.addEventListener("load",()=>{
	processContents();
})

async function processContents(self){
	let frame = self;
	if(!self) frame = document;
	// Sets the placeholder attribute to text-type inputs
	// This attribute is required for css animations related to their labels
	for(let input of document.querySelectorAll("input[type=text]")){
		if(input.getAttribute("placeholder") == null){
			input.setAttribute("placeholder"," ")
		}
	}
	
	// Makes #backButton elements redirect to the previous page when clicked
	let backButton = frame.querySelector("#backButton")
	if(backButton){
		backButton.addEventListener("click",()=>{
			window.history.back();
		})
	}
	
	// Something about handling file uploads ??
	for(let controller of frame.querySelectorAll(".fileUploadControl")){
		controller.addEventListener("click",()=>{
			frame.querySelector("#"+controller.dataset.input).click()
		})
	}
	
	// Handles elements that show images but arent don't have the img tag
	for(let pseudoImg of frame.querySelectorAll("[data-imgsrc]")){
		pseudoImg.style.backgroundImage="url("+pseudoImg.dataset.imgsrc+")";
	}
	
	// Sets the background-image of .icon elements to an url that depends on the data-icon attribute
	for(let icon of frame.querySelectorAll("[data-icon]")){
		icon.style.backgroundImage="url(\"assets/"+icon.dataset.icon+".svg\")";
	}
	
	// Handles grid elements:
	// Uses the data-columns to determine the number of columns, which adjusts the number of rows according to the number of children.
	// [colspan] elements inside a .grid element are given the appropriate grid-column style
	for(let grid of frame.querySelectorAll(".grid")){
		if(grid.dataset["columns"]){
			grid.style.gridTemplateColumns="repeat("+grid.dataset["columns"]+", 1fr)";
		}
	}
	for(let span of frame.querySelectorAll(".grid [colspan]")){
		span.style.gridColumn=span.getAttribute("colspan")+" span";
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
		modalCloseButton.addEventListener("click",()=>{
			modalBackdrop.remove()
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