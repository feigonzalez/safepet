<?php
	require_once "sql.php";
	require_once "functions/pushNotification.php";	//pushNotification($uID, $title, $description, $type)
	include "functions/postChat.php";	//postChat($pairCode, $accountId, $type, $content, $timestamp)
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	//var_dump($_POST);
	$response=array();
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to make report for.";
        echo json_encode($response);
        return;
    }
	if(!isset($_POST["phone"])){
	}
	if(!isset($_POST["account_id"])){
		$response["status"]="FAIL";
		$response["message"]="There was no account_id to make report as.";
		echo json_encode($response);
		return;
	}
	if(!isset($_POST["latitude"]) || !isset($_POST["longitude"])){
		$response["status"]="FAIL";
		$response["message"]="There was missing location data (latitude and/or longitude) to make report from.";
		echo json_encode($response);
		return;
	}

	$ins = $sqlConn->prepare("INSERT INTO `spet_reports` (`emitter_id`, `pet_id`, `timestamp`, `latitude`, `longitude`) values (?, ?, ?, ?, ?)");
	$ins->bind_param("iiidd",$_POST["account_id"],$_POST["pet_id"],$_POST["timestamp"],$_POST["latitude"],$_POST["longitude"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["emitter_id"]=$_POST["account_id"];
		$response["pet_id"]=$_POST["pet_id"];
		$response["timestamp"]=$_POST["timestamp"];
		$response["latitude"]=$_POST["latitude"];
		$response["longitude"]=$_POST["longitude"];
		echo json_encode($response);
		
		// Notify the owners of the pet that it has been found
		
		// 1. Get the data form the reporter
		$selRep = $sqlConn->prepare("SELECT * FROM `spet_users` WHERE user_id = ?");
		$selRep->bind_param("i",$_POST["account_id"]);
		$selRep->execute();
		$resRep=$selRep->get_result();
		if(mysqli_affected_rows($sqlConn)>0 || !$resRep){
			
		} else {	// Reporter has no registered account. Now what?
			
		}
		
		// 2. Get the list of owners for the found pet
		$selPet = $sqlConn->prepare("SELECT * FROM `spet_ownership` o JOIN `spet_pets` p ON o.pet_id = p.pet_id WHERE o.pet_id = ?");
		$selPet->bind_param("i",$_POST["pet_id"]);
		$selPet->execute();
		$resPet=$selPet->get_result();
		
		// 3. For each owner, notify them of the finding
		while($row = $resPet->fetch_array()){
			pushNotification($row["user_id"],
				"Han hallado a tu mascota, ".$row["name"],
				"Un usuario encontró a ".$row["name"].". Mira tus mensajes para ver dónde está.",
				"warning");
			postChat(intval($row["user_id"]) + intval($_POST["account_id"]), $_POST["account_id"], "geo", $_POST["latitude"].";".$_POST["longitude"], $_POST["timestamp"]);
		}
	} else {
		$response["status"]="FAIL";
		$response["message"]="Alert could not be generated.";
		echo json_encode($response);
	}
	//*/
?>