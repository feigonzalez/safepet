<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to remove pet from.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to remove.";
        echo json_encode($response);
        return;
    }

	// 1. Delete the user-pet relationship
	$delOwn = $sqlConn->prepare("DELETE  FROM `spet_ownership` WHERE `user_id` = ? AND `pet_id` = ?");
	$delOwn->bind_param("ii",$_POST["account_id"],$_POST["pet_id"]);
	$delOwn->execute();
	
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Couldn't remove pet from owner";
		echo json_encode($response);
	}
	
	// 2. Find all pets that have no owner anymore
	$selPet = $sqlConn->prepare("SELECT * FROM `spet_pets` p WHERE NOT EXISTS (SELECT 1 FROM `spet_ownership` o WHERE o.pet_id = p.pet_id);");
	$selPet->execute();
	$res=$selPet->get_result();
	
	// 3. Delete each of them
	if($res->num_rows > 0){
		while($row = $res->fetch_array()){
			$delPet = $sqlConn->prepare("DELETE FROM `spet_pets` WHERE `pet_id` = ?");
			$delPet->bind_param("i",$row["pet_id"]);
			$delPet->execute();
		}
	}
?>