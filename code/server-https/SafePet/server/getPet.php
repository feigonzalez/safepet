<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
	/*
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to validate pet ownership.";
        echo json_encode($response);
        return;
    }
	*/
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to fetch data for.";
        echo json_encode($response);
        return;
    }
	
	// La versión comentada requiere que el usuario que hace la petición sea el dueño de la mascota.
	// Esto no es deseable cuando, por ejemplo, se intenta reportar una mascota ajena como encontrada.
	//$stmt = $sqlConn->prepare("SELECT * FROM `spet_ownership` o JOIN `spet_pets` p ON o.pet_id = p.pet_id WHERE o.pet_id = ? AND o.user_id = ?");
	$stmt = $sqlConn->prepare("SELECT * FROM `spet_pets` WHERE `pet_id` = ?");
	$stmt->bind_param("i",$_POST["pet_id"]);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
		$row = $res->fetch_array();
		//$row["notification_id"] is the ID of the notification. Use it to delete it from the table after pulling
		$response["status"]="GOOD";
		$response["pet_id"]=$row["pet_id"];
		$response["name"]=$row["name"];
		$response["species"]=$row["species"];
		$response["breed"]=$row["breed"];
		$response["sex"]=$row["sex"];
		$response["petStatus"]=$row["status"];
		$response["color"]=$row["color"];
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No pet was found with given pet_id";
		echo json_encode($response);
	}
?>