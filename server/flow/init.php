<?php
	header("Content-Type: application/json");
	header('Access-Control-Allow-Origin: *');

	$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
	$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

	$userId     = $_GET["idUsuario"];
	$plan       = $_GET["plan"];
	$monto      = $_GET["monto"];
	$nombrePlan = $_GET["nombrePlan"];

	// URLS DEL SERVIDOR
	$returnUrl        = "http://dintdt.c1.biz/safepet/flow/return.php";
	$confirmationUrl  = "http://dintdt.c1.biz/safepet/flow/confirm.php";

	// Orden única
	$commerceOrder = "SP-" . $userId . "-" . strtoupper($plan);

	$data = array(
		"apiKey"          => $apiKey,
		"commerceOrder"   => $commerceOrder,
		"subject"         => "Suscripción " . $nombrePlan,
		"amount"          => intval($monto),
		"email"           => "cliente@example.com",
		"urlConfirmation" => $confirmationUrl,
		"urlReturn"       => $returnUrl,
	);

	// Firmar
	ksort($data);
	$stringToSign = "";
	foreach ($data as $key => $value) {
		$stringToSign .= $key . $value;
	}

	$signature = hash_hmac("sha256", $stringToSign, $secretKey);
	$data["s"] = $signature;

	// Enviar a Flow
	$curl = curl_init("https://sandbox.flow.cl/api/payment/create");
	curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);	// Retorna el resultado en vez de imprimirlo directamente

	$response = curl_exec($curl);
	if($response === false){
		$error = curl_error($curl);
		throw new Exception($error, 1);
	}
	else echo $response;
	curl_close($curl);
	echo "\n".$stringToSign."\n";
	var_dump($data);
?>