<?php

header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

// 2. TUS LLAVES (SANDBOX)
$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

// 3. URLs (Ajusta si tu carpeta tiene mayúsculas o minúsculas)
$baseUrl         = "http://dintdt.c1.biz/safepet/flow";
$returnUrl       = $baseUrl . "/return.php";
$confirmationUrl = $baseUrl . "/confirm.php";

// 4. RECIBIR DATOS
function param($k){
    return isset($_POST[$k]) ? $_POST[$k] : (isset($_GET[$k]) ? $_GET[$k] : null);
}

$userId    = param("idUsuario");
$plan      = param("plan");     // Esperamos 'basico' o 'premium'
$userEmail = param("email");

if(empty($userEmail)) $userEmail = "fran.mena@gmail.com"; 

if(empty($userId) || empty($plan)){
    die("Error: Faltan datos (idUsuario o plan).");
}

// 5. CONFIGURACIÓN DE PRECIOS (Según tu imagen)
$plansMap = array(
    // Clave URL      Nombre Visible       Precio
    "basico"  => array("name" => "Plan Basico",  "amount" => 5990),
    "premium" => array("name" => "Plan Premium", "amount" => 9990),
);

$planKey = strtolower(trim($plan));

// Si alguien intenta enviar "gratis" a Flow, lo detenemos
if($planKey == "gratis"){
    die("El Plan Gratis es automático, no requiere pago en Flow.");
}

if(!array_key_exists($planKey, $plansMap)){
    die("Error: El plan '$plan' no existe o no requiere pago.");
}

$nombrePlan = $plansMap[$planKey]["name"];
$monto      = $plansMap[$planKey]["amount"];

// 6. GENERAR ORDEN ÚNICA (Con rand para evitar Error 1080)
$commerceOrder = "SP-" . $userId . "-" . strtoupper($plan) . "-" . time() . "-" . rand(100, 999);

// 7. PREPARAR PAQUETE
$data = array(
    "apiKey"          => $apiKey,
    "commerceOrder"   => $commerceOrder,
    "subject"         => "Suscripcion " . $nombrePlan,
    "amount"          => intval($monto),
    "email"           => $userEmail,
    "urlConfirmation" => $confirmationUrl,
    "urlReturn"       => $returnUrl,
);

// 8. FIRMAR
ksort($data);
$stringToSign = "";
foreach ($data as $key => $value) {
    $stringToSign .= $key . $value;
}
$signature = hash_hmac("sha256", $stringToSign, $secretKey);
$data["s"] = $signature;

// 9. CONECTAR
$curl = curl_init("https://sandbox.flow.cl/api/payment/create");
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($curl);
if($response === false) die("Error Conexión: " . curl_error($curl));
curl_close($curl);

$result = json_decode($response, true);

// 10. RESULTADO
if(is_array($result) && isset($result['token'])){
    $urlPago = $result['url'] . "?token=" . $result['token'];
    header("Location: $urlPago");
    exit();
} else {
    echo "<h3>Error al iniciar pago</h3>";
    echo "Respuesta Flow: " . (isset($result['message']) ? $result['message'] : 'Error desconocido');
}
?>