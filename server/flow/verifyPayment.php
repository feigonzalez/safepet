<?php
	header("Access-Control-Allow-Origin: *");
	
	if(!isset($_GET["token"])){
		echo "<h1>Hubo un error</h1>";
		echo "<p>No hay un valor token para verificar la transacción.</p>";
		exit;
	}
	
	echo "<h2>token</h2>";
	var_dump($_GET["token"]);

	$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
	$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";
	
	$data = [
		"apiKey" => $apiKey,
		"token"  => $_GET["token"]
	];
	ksort($data);
	$toSign = ""; foreach($data as $k=>$v){ $toSign .= $k.$v; }
	$data["s"] = hash_hmac("sha256", $toSign, $secretKey);
	
	echo "<h2>data</h2>";
	var_dump($data);
	
	$url = "https://sandbox.flow.cl/api/payment/getStatus?" . http_build_query($data);
	$req = curlGetRequest($url);
	
	echo "<h2>req</h2>";
	var_dump($req);
	
	if($req === false){
		echo "<h1>Hubo un error</h1>";
		echo "<p>No se pudo conectar con Flow.cl</p>";
		exit;
	}
	
	// Redirecciona a la ubicacion asignada por Flow.cl
	header('Location: '.$_GET["returnURL"]."?apidata=".json_encode($data)."&response=".$req);
	
	function curlGetRequest($url){
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		return curl_exec($curl);
	}
?>