<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to verify pet ownership.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to remove tracker from.";
        echo json_encode($response);
        return;
    }
	
	// 1. Verificar que el usuario sea dueño de la mascota
	
		// TODO
	
	// 2. Eliminar registro del rastreador

	$del = $sqlConn->prepare("DELETE FROM `spet_trackers` WHERE `pet_id` = ?");
	$del->bind_param("i",$_POST["pet_id"]);
	$del->execute();

	$res=$del->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Tracker could not be removed.";
		echo json_encode($response);
	}
?>