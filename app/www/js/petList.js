async function beforeLoad(){
	document.querySelector("#accountName").textContent=userData.firstName;
	//document.querySelector("#profileImage").dataset.imgsrc=accountData["image"];

	petData = await request(SERVER_URL+"getPetList.php",{account_id:userData.account_id});
	for(let pet of petData){
		pet["sexIndicator"]=pet["sex"]=="hembra"?"female":"male";
	}
	if(petData.status=="MISS"){
		document.querySelector("#petList .card").innerHTML="No tienes ninguna mascota registrada";
	} else {
		fillIterable(document.querySelector("[foreach=pets]"),petData)
		for(let bI of document.querySelectorAll(".breedIndicator")){
			if(bI.textContent.trim()=="()") bI.remove();
		}
	}
}