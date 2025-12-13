<?php
// return.php - VERSIÓN PUENTE A LOCALHOST
header('Content-Type: text/html; charset=utf-8');
date_default_timezone_set('America/Santiago');

// 1. DATOS DE CONEXIÓN
$host_db = 'fdb3.biz.nf';       
$user_db = '2031229_llsdb';     
$pass_db = '{1q7vZsV4w1,Y^e_';  
$name_db = '2031229_llsdb';     

// 2. FLOW
$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

$token = isset($_REQUEST['token']) ? $_REQUEST['token'] : null;
$statusPago = "espera";
$nombrePlan = "---";
$planParaUrl = "gratis"; // Variable para enviar a tu App

if($token) {
    $params = array("apiKey" => $apiKey, "token" => $token);
    ksort($params);
    $stringToSign = "";
    foreach ($params as $key => $value) { $stringToSign .= $key . $value; }
    $params["s"] = hash_hmac("sha256", $stringToSign, $secretKey);

    $curl = curl_init("https://sandbox.flow.cl/api/payment/getStatus?" . http_build_query($params));
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0); 
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0); 
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($curl);
    curl_close($curl);
    
    $result = json_decode($response, true);

    if(isset($result['status']) && $result['status'] == 2) {
        $statusPago = "aprobado";
        
        $ordenParts = explode("-", $result['commerceOrder']);
        $idUsuario  = isset($ordenParts[1]) ? $ordenParts[1] : 0; 
        $planNuevo  = isset($ordenParts[2]) ? strtolower($ordenParts[2]) : 'basico';
        
        // Actualizamos BD en la nube
        $conn = new mysqli($host_db, $user_db, $pass_db, $name_db);
        if (!$conn->connect_error) {
            if($idUsuario != 0 && $idUsuario != "undefined") {
                $stmt = $conn->prepare("UPDATE spet_users SET plan = ? WHERE user_id = ?");
                $stmt->bind_param("si", $planNuevo, $idUsuario); 
                $stmt->execute();
                $stmt->close();
            }
            $conn->close();
        }
        $nombrePlan = ucfirst($planNuevo);
        $planParaUrl = $planNuevo; // Guardamos el plan para enviarlo
    } else {
        $statusPago = "rechazado";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Finalizado</title>
    <style>body{font-family:sans-serif;text-align:center;padding:50px;}</style>
</head>
<body>
    <?php if($statusPago == "aprobado"): ?>
        <h1 style="color:green">¡Pago Exitoso!</h1>
        <p>Volviendo a tu App...</p>
    <?php else: ?>
        <h1 style="color:red">Error en el pago</h1>
    <?php endif; ?>

    <script>
        // REDIRECCIÓN INTELIGENTE
        // Enviamos el resultado y el plan en la URL de vuelta a tu Localhost
        setTimeout(function() {
            var plan = "<?php echo $planParaUrl; ?>";
            var estado = "<?php echo $statusPago; ?>";
            
            // Construimos la URL con datos
            var urlDestino = "http://127.0.0.1:5501/index.html?pago=" + estado + "&nuevo_plan=" + plan;
            
            window.location.replace(urlDestino);
        }, 2000);
    </script>
</body>
</html>