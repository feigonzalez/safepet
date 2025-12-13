<?php
header('Access-Control-Allow-Origin: *');

$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

$token = isset($_GET["token"]) ? $_GET["token"] : (isset($_POST["token"]) ? $_POST["token"] : null);
$order = isset($_GET["order"]) ? $_GET["order"] : null;
$appReturn = isset($_GET['appReturn']) ? $_GET['appReturn'] : null;

// Fallback: intentar obtener appReturn desde cookie si no viene en la URL
if((!$appReturn || $appReturn==='') && isset($_COOKIE['spet_appReturn'])){
    $appReturn = $_COOKIE['spet_appReturn'];
}

// Si falta token, intentar recuperarlo desde archivo tmp por order
// Si no hay order en la URL, intentar recuperar de cookie
if((!$order || $order==='') && isset($_COOKIE['spet_lastOrder'])){
    $order = $_COOKIE['spet_lastOrder'];
}

if(!$token && $order){
    $mapFile = __DIR__ . "/tmp/ord_".$order.".json";
    if(is_file($mapFile)){
        $map = json_decode(@file_get_contents($mapFile), true);
        if(is_array($map) && !empty($map["token"])){
            $token = $map["token"];
        }
        if(empty($appReturn) && !empty($map["appReturn"])){
            $appReturn = $map["appReturn"];
        }
    }
}

// Consultar estado y recuperar commerceOrder
$data = ["apiKey"=>$apiKey, "token"=>$token];
ksort($data);
$toSign=""; foreach($data as $k=>$v){ $toSign .= $k.$v; }
$data["s"] = hash_hmac("sha256", $toSign, $secretKey);

$curl = curl_init("https://sandbox.flow.cl/api/payment/getStatus");
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($curl);
curl_close($curl);
$json = @json_decode($response, true);

echo "[!] response:\n";
var_dump($response);
echo "\n[!] end of response:\n";

$status = (is_array($json) && isset($json["status"]) && intval($json["status"])===2) ? "paid" : "rejected";
$order  = $order ?: (is_array($json) ? ($json["commerceOrder"] ?? null) : null);

// Buscar appReturn guardado en init.php
$appReturn = null;
if($order){
    $file = __DIR__ . "/tmp/ord_".$order.".json";
    if(is_file($file)){
        $map = json_decode(@file_get_contents($file), true);
        if(is_array($map) && !empty($map["appReturn"])){
            $appReturn = $map["appReturn"];
        }
    }
}

if(isset($appReturn) && $appReturn){
    $sep = (strpos($appReturn,'?')!==false) ? '&' : '?';
    $qs = 'flowReturn=1';
    if($token){ $qs .= '&token='.urlencode($token); }
    if($order){ $qs .= '&order='.urlencode($order); }
    $qs .= '&status='.urlencode($status);
    $redir = $appReturn.$sep.$qs;
    //header('Location: '.$redir);
    echo "<a href='".$redir."'>Volver a la aplicación</a>";
}

echo "<h3>Retorno de pago</h3>";
if($token){ echo "Token: ".htmlspecialchars($token); }
if($order){ echo "<br>Orden: ".htmlspecialchars($order); }
?>
