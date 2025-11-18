<?php
	header("Content-Type: application/json");
	header('Access-Control-Allow-Origin: *');

	// Tus claves Flow
	$apiKey    = "6663F0F9-539D-4487-A4CA-2FL416B20197";
	$secretKey = "a5481b790444ca0ab25beb4d0d978cbbb3316a87";

	$userId     = $_POST["idUsuario"];
	$plan       = $_POST["plan"];
	$monto      = $_POST["monto"];
	$nombrePlan = $_POST["nombrePlan"];

	// URLS DEL SERVIDOR (AJUSTAR LA RUTA)
	$returnUrl        = "https://dintdt.c1.biz/safepet/server/flow/return.php";
	$confirmationUrl  = "https://dintdt.c1.biz/safepet/server/flow/confirm.php";

	// Orden única
	$commerceOrder = "SP-" . $userId . "-" . strtoupper($plan) . "-" . time();

	$data = array(
		"apiKey"          => $apiKey,
		"subject"         => "Suscripción " . $nombrePlan,
		"amount"          => intval($monto),
		"commerceOrder"   => $commerceOrder,
		"email"           => "cliente@example.com",
		"urlReturn"       => $returnUrl,
		"urlConfirmation" => $confirmationUrl
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
	$curl = curl_init("https://www.flow.cl/api/payment/create");
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($curl);
	curl_close($curl);

	echo $response;
?>
