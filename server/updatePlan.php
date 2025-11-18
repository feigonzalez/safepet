<?php
	/* OPCIONAL CAMBIAR DE PLAN DE MANERA MANUAL */
	
	header("Content-Type: application/json");  // Indica que esta página devuelve un objeto JSON.
	header('Access-Control-Allow-Origin: *');  // Permite llamar a la página desde lugares externos al servidor, como la aplicacion móvil.
	require_once "sql.php";                    // Contiene los datos de la conexión a la base de datos. Usa la variable $sqlConn para la conexión.
	
	$userId = $_POST["idUsuario"];
	$plan   = $_POST["plan"];
	
	/* Se podría verificar que el campo $_POST["idUsuario"] exista, y que falle en caso de que no. */
	
	/* Se podría verificar que el campo $_POST["plan"] exista, y que falle en caso de que no. */
	
	$stmt = $sqlConn->prepare("UPDATE `spet_users` SET `plan` = ? WHERE `user_id` = ?");
	$stmt->bind_param("si",$plan, $userId);	//"s":string, "i":integer
	$ok = $stmt->execute();
	
	/* Se podría verificar que la sentencia SQL se ejecutó correctamente, y que indique el estado de éxito en la respuesta. */
	
	echo json_encode(["success" => $ok]);
	
	/* Todas las sugerencias indicadas se aplican en otros archivos .php, si quieres ver cómo se está haciendo en el resto del proyecto. */
?>