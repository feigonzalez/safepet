<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	
	$response=array();
    
	if(!isset($_POST["pair_code"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pair_code to delete messages for.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to delete messages for.";
        echo json_encode($response);
        return;
    }
	
	$del = $sqlConn->prepare("DELETE FROM `spet_messages` WHERE (`sender_id` + `receiver_id` = ?) AND (`sender_id` = ? OR `receiver_id` = ?)");
	$del->bind_param("iii",$_POST["pair_code"],$_POST["account_id"],$_POST["account_id"]);
	$del->execute();
	$res=$del->get_result();
	
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="No alerts were deleted";
		echo json_encode($response);
	}
?>