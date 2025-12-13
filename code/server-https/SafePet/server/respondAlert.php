<?php
	include "sql.php";
	include "functions/pushNotification.php";
	
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
	
	pushNotification($_POST["account_id"],"¡Han hallado a tu mascota!","Un usuario ha encontrado a ???","warning");
?>