<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

$token = isset($_GET["token"]) ? $_GET["token"] : (isset($_POST["token"]) ? $_POST["token"] : null);
$order = isset($_GET["order"]) ? $_GET["order"] : null;
if(!$token && $order){
    $mapFile = __DIR__ . "/tmp/ord_".$order.".json";
    if(is_file($mapFile)){
        $map = json_decode(@file_get_contents($mapFile), true);
        if(is_array($map) && !empty($map["token"])){
            $token = $map["token"];
        }
    }
}
if(!$token){
    echo json_encode(["error"=>"Falta token"]);
    exit();
}

$data = ["apiKey"=>$apiKey, "token"=>$token];
ksort($data);
$toSign = ""; foreach($data as $k=>$v){ $toSign .= $k.$v; }
$data["s"] = hash_hmac("sha256", $toSign, $secretKey);

$curl = curl_init("https://sandbox.flow.cl/api/payment/getStatus");
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($curl);
if($response === false){
    echo json_encode(["error"=>curl_error($curl)]);
    curl_close($curl);
    exit();
}
curl_close($curl);
$json = @json_decode($response, true);
if(is_array($json)){
    echo json_encode([
        "status" => isset($json["status"]) ? intval($json["status"]) : null,
        "commerceOrder" => $json["commerceOrder"] ?? ($order ?? null),
        "token" => $token
    ]);
} else {
    echo $response;
}
?>
