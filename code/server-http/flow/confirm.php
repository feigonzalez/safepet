<?php
// confirm.php (En DintDt - Servidor Real)
// Recibe el token del repetidor y actualiza la BD
/*
// Imprime los valores entregados por flow.cl en un archivo llamado dump.txt
ob_flush();
ob_start();
echo "\n dump POST \n";
var_dump($_POST);
echo "\n dump GET \n";
var_dump($_GET);
file_put_contents("dump.txt", ob_get_flush());
*/

// 1. Conexión LOCAL a la BD (Porque estamos en el mismo servidor)
$host_db = 'fdb3.biz.nf'; $user_db = '2031229_llsdb'; $pass_db = '{1q7vZsV4w1,Y^e_'; $name_db = '2031229_llsdb';     
$apiKey = "5745DF16-A963-447A-99EB-6D6AADL5E636"; $secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

$token = isset($_POST['token']) ? $_POST['token'] : null;

if($token) {
    // Verificar con Flow que el pago es real
    $params = array("apiKey" => $apiKey, "token" => $token); ksort($params);
    $sign = ""; foreach ($params as $k => $v) $sign .= $k . $v;
    $params["s"] = hash_hmac("sha256", $sign, $secretKey);

    // Esto no va a funcionar porque este servidor (dintdt.c1.biz) no se va a conectar con flow.cl
    $curl = curl_init("https://sandbox.flow.cl/api/payment/getStatus?" . http_build_query($params));
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0); curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $res = json_decode(curl_exec($curl), true);
    curl_close($curl);

    if(isset($res['status']) && $res['status'] == 2) {
        // ACTUALIZAR BASE DE DATOS
        $parts = explode("-", $res['commerceOrder']);
        $uid = $parts[1]; $plan = strtolower($parts[2]);

        $conn = new mysqli($host_db, $user_db, $pass_db, $name_db);
        if(!$conn->connect_error){
            $stmt = $conn->prepare("UPDATE spet_users SET plan = ? WHERE user_id = ?");
            $stmt->bind_param("si", $plan, $uid);
            $stmt->execute();
            $conn->close();
        }
        echo "BD ACTUALIZADA";
    }
}
?>