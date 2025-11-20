async function beforeLoad(){
	document.querySelector("#accountName").textContent=userData.firstName;
	//document.querySelector("#profileImage").dataset.imgsrc=accountData["image"];

	petData = await request(SERVER_URL+"getPetList.php",{account_id:userData.account_id});
	if(petData.status=="MISS"){
		document.querySelector("#petList .card").innerHTML="No tienes ninguna mascota registrada";
	} else {
		for(let pet of petData){
			pet["sexIndicator"]=pet["sex"]=="hembra"?"female":"male";
		}
		fillIterable(document.querySelector("[foreach=pets]"),petData)
		for(let bI of document.querySelectorAll(".breedIndicator")){
			if(bI.textContent.trim()=="()") bI.remove();
		}
		for(let pI of document.querySelectorAll(".petImageDisplay")){
			pI.style.filter="hue-rotate("+(-10*(parseInt(hash(pI.dataset.petname),36)%12))+"deg)";
		}
	}
}