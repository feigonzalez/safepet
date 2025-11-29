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
        $response["message"]="There was no pet_id to remove alert for.";
        echo json_encode($response);
        return;
    }

	// 1. Verify that user is owner of pet
	
		// TODO
	
	// 2. Delete all alerts for this pet
	
	$delOwn = $sqlConn->prepare("DELETE FROM `spet_alerts` WHERE `pet_id` = ?");
	$delOwn->bind_param("i",$_POST["pet_id"]);
	$delOwn->execute();
	$res=$delOwn->get_result();
	
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
		
	// 3. The pet's status should be updated to be HOME
	
		$upd = $sqlConn->prepare("UPDATE `spet_pets` SET `status` = 'HOME' WHERE `pet_id` = ?");
		$upd->bind_param("i",$_POST["pet_id"]);
		$upd->execute();
		// The pet's status would be updated by now. We don't check for it though because it's not that important.
		
	} else {
		$response["status"]="FAIL";
		$response["message"]="No alerts were deleted";
		echo json_encode($response);
	}
?>