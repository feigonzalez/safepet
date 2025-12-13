<?php
	include "sql.php";
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
    if(!isset($_POST["latitude"]) || !isset($_POST["longitude"])){
        $response["status"]="FAIL";
        $response["message"]="There was missing location data (latitude and/or longitude) to make alert from.";
        echo json_encode($response);
        return;
    }

	$ins = $sqlConn->prepare("INSERT INTO `spet_alerts` (`emitter_id`, `pet_id`, `timestamp`, `latitude`, `longitude`) values (?, ?, ?, ?, ?)");
	$ins->bind_param("iiidd",$_POST["account_id"],$_POST["pet_id"],$_POST["timestamp"],$_POST["latitude"],$_POST["longitude"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		// Success in creating the alert.
		// The pet's state must be updated
		
		$ins = $sqlConn->prepare("UPDATE `spet_pets` SET `status` = 'LOST' WHERE `pet_id` = ?");
		$ins->bind_param("i",$_POST["pet_id"]);
		$ins->execute();
		// The pet's status would be updated by now. We don't check for it though because it's not that important.
		
		$response["status"]="GOOD";
		$response["emitter_id"]=$_POST["account_id"];
		$response["pet_id"]=$_POST["pet_id"];
		$response["timestamp"]=$_POST["timestamp"];
		$response["latitude"]=$_POST["latitude"];
		$response["longitude"]=$_POST["longitude"];
		echo json_encode($response);
		
	} else {
		$response["status"]="FAIL";
		$response["message"]="Alert could not be generated.";
		echo json_encode($response);
	}
	//*/
?>