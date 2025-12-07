<?php
	header("Content-Type: application/json");
	header('Access-Control-Allow-Origin: *');

	$apiKey    = "5745DF16-A963-447A-99EB-6D6AADL5E636";
	$secretKey = "abf248d2e87af3a68542899406c4f39007e10914";

	$userId     = $_GET["idUsuario"];
	$plan       = $_GET["plan"];
	$monto      = $_GET["monto"];
	$nombrePlan = $_GET["nombrePlan"];
	$userEmail  = isset($_GET["email"]) ? trim($_GET["email"]) : "";
	if(!$userEmail){ $userEmail = "safe.pet+".$userId."@gmail.com"; }
	if($nombrePlan){
		$nombrePlan = strtr($nombrePlan, [
			"á"=>"a","Á"=>"A","é"=>"e","É"=>"E","í"=>"i","Í"=>"I",
			"ó"=>"o","Ó"=>"O","ú"=>"u","Ú"=>"U","ñ"=>"n","Ñ"=>"N"
		]);
	}

	// Construir la orden UNA VEZ y reutilizarla en todas partes
	$commerceOrder = "SP-" . $userId . "-" . strtoupper($plan) . "-" . time();

	// URLS DEL SERVIDOR (HTTPS requeridas por Flow)
	$returnBaseURL = isset($_GET['returnBaseURL']) ? $_GET['returnBaseURL'] : null;
	// Persistir en cookie para fallback en return.php
	if($returnBaseURL){
		@setcookie('spet_appReturn', $returnBaseURL, time()+3600, '/');
	}
	// Flow sandbox puede fallar si urlReturn tiene query params; usar URL limpia
	$returnUrl        = "https://safepet.rf.gd/SafePet/server/flow/return.php";
	$confirmationUrl  = "https://safepet.rf.gd/SafePet/server/flow/confirm.php";

    $data = array(
        "apiKey"          => $apiKey,
        "commerceOrder"   => $commerceOrder,
        "subject"         => "Suscripcion " . $nombrePlan,
        "amount"          => intval($monto),
        "email"           => $userEmail,
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

	// No guardamos aún; se guardará luego con el token

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
        echo json_encode(["status"=>"FAIL","message"=>"Error Conexión: ".$error]);
        curl_close($curl);
        exit();
    }
    curl_close($curl);
	$json = @json_decode($response, true);
    // Log debug de la creación
    $logDir = __DIR__ . "/tmp";
    if(!is_dir($logDir)) @mkdir($logDir,0777,true);
	@file_put_contents($logDir."/last_create.json", json_encode([
		"request"=>$data,
		"appReturn"=>$returnBaseUrl+"verifySub.html",
		"response_raw"=>$response,
		"response_json"=>$json
	], JSON_PRETTY_PRINT));

	// Guardar mapping order -> token y appReturn para uso en return.php
	if(is_array($json) && isset($json["token"])){
		@file_put_contents($logDir."/ord_".$commerceOrder.".json", json_encode([
			"token"=>$json["token"],
			"appReturn"=>$appReturn
		]));
		@setcookie('spet_lastOrder', $commerceOrder, time()+3600, '/');
	}
    if(is_array($json) && isset($json["url"]) && isset($json["token"])){
        header('Location: '.$json["url"]."?token=".$json["token"]);
        exit();
    }
    echo $response;
?>
