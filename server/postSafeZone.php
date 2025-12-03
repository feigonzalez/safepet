<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to verify ownership for.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to define safe zone for.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["latitude"]) || !isset($_POST["longitude"]) || !isset($_POST["radius"])){
        $response["status"]="FAIL";
        $response["message"]="There was no latitude, longitude, or radius to determine safe zone area.";
        echo json_encode($response);
        return;
    }
	
	// 1. Verificar que el usuario es dueño de la mascota
	
		// TODO
	
	// 1.1 Verificar que el usuario tiene el plan necesario (premium) para realizar cambios
	
		// TODO
	
	// 2. Actualizar los datos de la zona segura en el tracker correspondiente

	$timestamp = strtotime(date("Y-m-d H:i:s"));
	
	$ins = $sqlConn->prepare("UPDATE `spet_trackers` SET
		`safezone_latitude` = ?,
		`safezone_longitude` = ?,
		`safezone_radius` = ?
		WHERE `pet_id` = ?");
	$ins->bind_param("ddii",$_POST["latitude"],$_POST["longitude"],$_POST["radius"],$_POST["pet_id"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["account_id"]=$_POST["account_id"];
		$response["pet_id"]=$_POST["pet_id"];
		$response["safezone_latitude"]=$_POST["latitude"];
		$response["safezone_longitude"]=$_POST["longitude"];
		$response["safezone_radius"]=$_POST["radius"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
        $response["message"]="Safe zone info could not be updated.";
		echo json_encode($response);
	}
?>