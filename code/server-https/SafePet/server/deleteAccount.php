<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to delete.";
        echo json_encode($response);
        return;
    }

	$del = $sqlConn->prepare("DELETE FROM `spet_users` WHERE `user_id` = ?");
	$del->bind_param("i",$_POST["account_id"]);
	$del->execute();

	$res=$del->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
		
		// 1. Delete all pet-owner relationships of the deleted account
		$delOwn = $sqlConn->prepare("DELETE  FROM `spet_ownership` WHERE user_id = ?");
		$delOwn->bind_param("i",$_POST["pet_id"]);
		$delOwn->execute();
		
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
		
	} else {
		$response["status"]="FAIL";
		$response["message"]="Account could not be deleted.";
		echo json_encode($response);
	}
	//*/
?>