<?php
	header("Content-Type: application/json");

	require_once("../sql.php");

	// Claves Flow
	$apiKey    = "6663F0F9-539D-4487-A4CA-2FL416B20197";
	$secretKey = "a5481b790444ca0ab25beb4d0d978cbbb3316a87";

	// Flow envía este token
	$token = $_POST["token"];

	// Consultar estado del pago
	$data = array(
		"apiKey" => $apiKey,
		"token"  => $token
	);

	ksort($data);
	$stringToSign = "";
	foreach ($data as $k => $v) {
		$stringToSign .= $k . $v;
	}

	$signature = hash_hmac("sha256", $stringToSign, $secretKey);
	$data["s"] = $signature;

	$curl = curl_init("https://www.flow.cl/api/payment/getStatus");
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	$result = json_decode(curl_exec($curl), true);
	curl_close($curl);

	// FLOW STATUS 2 = PAGADO
	if ($result["status"] == 2) {

		// commerceOrder = SP-ID-PLAN-TIME
		$order = $result["commerceOrder"];
		$parts = explode("-", $order);

		$userId = $parts[1];
		$plan   = $parts[2];

		// ❗❗ NECESITO NOMBRES CORRECTOS DE TU BD
		// EJEMPLO:
		// Tabla: usuarios
		// Campo ID: id
		// Campo Plan: plan

		$stmt = $db->prepare("UPDATE `spet_users` SET `plan` = ? WHERE `user_id` = ?");
		$stmt->execute([$plan, $userId]);

		echo json_encode(["status" => "success", "msg" => "Suscripción actualizada"]);
		exit();
	}

	// SI NO ESTÁ PAGADO
	echo json_encode([
		"status"  => "error",
		"message" => "Pago no confirmado"
	]);

?>
