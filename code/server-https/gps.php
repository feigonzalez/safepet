<?php
	header('Access-Control-Allow-Origin: *');
	
	if(isset($_GET["id"])){
		$tid = $_GET["id"];
		$lat = $_GET["lat"];
		$lng = $_GET["lng"];
		$acc = $_GET["acc"];
		$prd = $_GET["period"];
		
		$data=[
			"tracker_id" => $tid,
			"latitude" => $lat,
			"longitude" => $lng,
			"accuracy" => $acc
		];
		$curl = curl_init("http://dintdt.c1.biz/safepet/updateTrackerInfo.php");
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($curl);
		if($response === false){
			$error = curl_error($curl);
			throw new Exception($error, 1);
		}
		
		if(isset($_GET["period"])){
			echo "<script class='php_generated'>const timer = ".$_GET["period"]."</script>";
		}
		echo '<script class="php_generated">window.addEventListener("load",()=>{document.querySelector("#trackerID").value='.$_GET["id"].'})</script>';
	}
?>
<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
	<!--script src="mobile.js"></script-->
</head>
<script defer>
	
	function clearTracking(){
		clearInterval(trackInterval);
		addNotice({status:"DONE",
			message:"Seguimiento terminado"})
	}
	
	function addNotice(update){
		document.querySelector("#noticeList").innerHTML=
			"<div class='notice'><span class='noticeBadge "+update.status+"'>"+update.status+"</span><span class='noticeContent'>"+update.message+"</span></div>"+document.querySelector("#noticeList").innerHTML
	}
	
	async function postLocation(period){
		addNotice({status:"WAIT",
			message:"Obteniendo ubicación..."})
		if(!navigator.geolocation){
			addNotice({status:"FAIL",
				message:"Este navegador no permite geolocalización."});
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position)=>{	//On Success
				addNotice({status:"WAIT",
					message:"Publicando ubicación..."})
				loc= {
					"id":document.querySelector("#trackerID").value,
					"lat":position.coords.latitude,
					"long":position.coords.longitude,
					"acc":position.coords.accuracy,
					"period":period	// segundos a esperar antes de publicar la ubicacion otra vez. "0" lo hace una sola vez
				}
				console.log("Post location ["+loc.lat+"; "+loc.long+"]")
				window.location.href=`gps.php?id=${loc.id}&lat=${loc.lat}&lng=${loc.long}&acc=${loc.acc}`+(period>0?`&period=${period}`:"");
			},
			()=>{	//On Error
				addNotice({status:"FAIL",
					message:"No se pudo obtener ubicación"})
			}
		)
	}
	
	window.addEventListener("load",()=>{
		
		if(typeof(timer)!=="undefined"){
			trackInterval = setInterval(()=>{postLocation(timer)},timer*1000);
		}
		document.querySelector("#button_locate").addEventListener("click",()=>{postLocation(0);})
		document.querySelector("#button_track").addEventListener("click",()=>{postLocation(15);})
		document.querySelector("#button_clear").addEventListener("click",()=>{clearTracking();})
		document.querySelector("#qrCode").setAttribute("src","https://api.qrserver.com/v1/create-qr-code/?data=safepet:gpstrackerid=0")
		document.querySelector("#trackerID").addEventListener("change",(ev)=>{
			document.querySelector("#qrCode").setAttribute("src","https://api.qrserver.com/v1/create-qr-code/?data=safepet:gpstrackerid="+ev.target.value)
		})
	})
</script>
<body>
	<div id="qrContainer">
		<img id="qrCode">
		<input id="trackerID" value=0>
	</div>
	<div id="buttons">
		<button id="button_locate">Publicar ubicación</button>
		<button id="button_track">Comenzar seguimiento</button>
		<button id="button_clear">Terminar seguimiento</button>
	</div>
	<div id="noticeList"></div>
</body>
<style>
	*{font-size:5vw}
	body{margin:0;display:flex;flex-direction:column}
	button{display:block;width:80vw;text-align:center;padding:0.5em;margin:0.5em auto;border-radius:2em;border:none;background-color:#f44;color:#fff}
	#buttons, #noticeList{margin:0.5em}
	#noticeList{overflow-y:scroll}
	
	.notice{margin:0.1rem;font-family:monospace;}
	.noticeBadge{padding:0 0.5rem;border-radius:1rem;color:#fff;background-color:#000;margin:0.2rem}
	.noticeBadge.OKAY, .noticeBadge.GOOD{background-color:#4a4}
	.noticeBadge.FAIL{background-color:#a44}
	.noticeBadge.WAIT{background-color:#888}
	.noticeBadge.DONE{background-color:#44a}
	
	#qrContainer{width:100%;display:flex;flex-direction:column;align-items:center}
	#qrCode{padding:2em;border:solid 1px #ccc;border-radius:1em;width:50vw;height:50vw;;margin:1em}
	#trackerID{padding:1em;border-radius:2em;border:solid 1px #ccc;text-align:center}
</style>