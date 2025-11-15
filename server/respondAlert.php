<?php
	include "sql.php";
	include "pushNotification.php";
	
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	//var_dump($_POST);
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to make alert as.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to make alert for.";
        echo json_encode($response);
        return;
    }
	
	pushNotification($_POST["account_id"],"¡Han hallado a tu mascota!","Un usuario ha encontraron a ???","warning");
	/*
	// Alerts should not be deleted untill the owner has set the pet's state to HOME
	
	$ins = $sqlConn->prepare("DELETE FROM `spet_alerts` WHERE `pet_id` = ?");
	$ins->bind_param("i",$_POST["pet_id"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
		$response["message"]="There were no alerts for the given pet.";
		echo json_encode($response);
	}
	//*/
?>