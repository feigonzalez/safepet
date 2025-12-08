<?php
	header('Access-Control-Allow-Origin: *');

	// 1. Asigna los datos que se van a mandar a Flow.cl
	$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
	$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";
	
	$userId     = $_GET["idUsuario"];
	$plan       = $_GET["plan"];
	$monto      = $_GET["monto"];
	$nombrePlan = $_GET["nombrePlan"];
	$userEmail  = $_GET["email"];
	
	$commerceOrder = "SP-" . $userId . "-" . strtoupper($plan) . "-" . time();
	
	$returnUrl        = $_GET["appReturn"];
	//$confirmationUrl  = "https://safepet.rf.gd/SafePet/server/flow/confirmPayment.php";
	$confirmationUrl  = "http://dintdt.c1.biz/safepet/flow/confirmPayment.php?uid=".$userId;

	// 2. Arma el arreglo con los datos a pasarle a Flow.cl
	$data = array(
		"apiKey"          => $apiKey,
		"commerceOrder"   => $commerceOrder,
		"subject"         => "Suscripcion " . $nombrePlan,
		"amount"          => intval($monto),
		"email"           => $userEmail,
		"urlConfirmation" => $confirmationUrl,
		"urlReturn"       => $returnUrl,
	);
	
	ksort($data);
	$stringToSign = "";
	foreach ($data as $key => $value) {
		$stringToSign .= $key . $value;
	}

	$signature = hash_hmac("sha256", $stringToSign, $secretKey);
	$data["s"] = $signature;
	
	echo "<h2>data</h2>";
	var_dump($data);
	// 3. Se hace la petición a Flow.cl
	$response = curlRequest("https://sandbox.flow.cl/api/payment/create",$data);
	
	echo "<h2>response</h2>";
	var_dump($response);
	
	
	// 3.1. Si ocurrió un error, se retorna un mensaje de error?
	//      Como se redirigió a esta página, debería volver a la página anterior, creo, con un mensaje de error
	if($response === false){
		echo "<h1>Hubo un error</h1>";
		echo "<p>No se pudo conectar con Flow.cl</p>";
		exit;
	}
	
	$json = json_decode($response,TRUE);
	echo "<h2>json</h2>";
	var_dump($json);
	
	
	if(!isset($json) || !isset($json["token"])){
		echo "<h1>Hubo un error</h1>";
		echo "<p>No se recibió un token desde Flow.cl</p>";
		exit;
	}
	
	/*
	
	// solicitar a server DINT que guarde el token para el usuario
	$tokenData = [
		"account_id" => $userId,
		"token"      => $json["token"]
	];
	
	$tokenResponse = curlRequest("http://dintdt.c1.biz/safepet/postToken.php",$tokenData);
	echo "<h2>tokenResponse</h2>";
	var_dump($tokenResponse);
	
	*/
	
	// Redirecciona a la ubicacion asignada por Flow.cl
	header('Location: '.$json["url"]."?token=".$json["token"]);
	
	function curlRequest($url,$params){
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		return curl_exec($curl);
	}
?>

