window.addEventListener("load",()=>{
	console.log("URLparams:", URLparams)
	document.body.innerHTML+="<div><pre>Api Data:\n"+JSON.stringify(JSON.parse(URLparams["apidata"]),"",1)+"</pre></div>";
	document.body.innerHTML+="<div><pre>Flow Response:\n"+JSON.stringify(JSON.parse(URLparams["response"]),"",1)+"</pre></div>";
})