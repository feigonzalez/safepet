<?php
header("Content-Type: application/json");

require_once("../functions/sql.php");  // ← ruta correcta

$apiKey    = "6663F0F9-539D-4487-A4CA-2FL416B20197";
$secretKey = "a5481b790444ca0ab25beb4d0d978cbbb3316a87";

$token = $_POST["token"];

$data = array(
    "apiKey" => $apiKey,
    "token"  => $token
);

ksort($data);
$stringToSign = "";
foreach ($data as $k => $v) {
    $stringToSign .= $k . $v;
}

$data["s"] = hash_hmac("sha256", $stringToSign, $secretKey);

// Obtener estado
$curl = curl_init("https://www.flow.cl/api/payment/getStatus");
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$result = json_decode(curl_exec($curl), true);
curl_close($curl);

if ($result["status"] == 2) {

    // commerceOrder = SP-ID-PLAN-TIME
    $orderParts = explode("-", $result["commerceOrder"]);
    $userId = $orderParts[1];
    $plan   = strtolower($orderParts[2]);

    // Actualizar plan
    $stmt = $sqlConn->prepare("UPDATE `spet_users` SET `plan` = ? WHERE `user_id` = ?");
    $stmt->bind_param("si", $plan, $userId);
    $stmt->execute();

    echo json_encode(["status" => "success", "msg" => "Plan actualizado"]);
    exit();
}

// ERROR
echo json_encode(["status" => "error", "message" => "Pago no confirmado"]);
?>
