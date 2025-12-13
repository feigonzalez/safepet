<?php
	header("Content-Type: application/json");
	header('Access-Control-Allow-Origin: *');


	$data = array(
		"idUsuario"  => $_POST["idUsuario"],
		"plan"       => $_POST["plan"],
		"monto"      => $_POST["monto"],
		"nombrePlan" => $_POST["nombrePlan"]
	);

	// Enviar a Flow
	$curl = curl_init("https://safepet.rf.gd/SafePet/server/flow/init.php");
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
?>