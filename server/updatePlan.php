<?php
	require_once "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
	if(!isset($_POST["account_id"])){
		$response["status"]="FAIL";
		$response["message"]="There was no account_id to update plan for.";
		echo json_encode($response);
		return;
	}
	if(!isset($_POST["plan"])){
		$response["status"]="FAIL";
		$response["message"]="There was no plan to update to.";
		echo json_encode($response);
		return;
	}
	
	$stmt = $sqlConn->prepare("UPDATE `spet_users` SET `plan` = ? WHERE `user_id` = ?");
	$stmt->bind_param("si",$_POST["plan"],$_POST["account_id"]);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["account_id"]=$_POST["account_id"];
		$response["plan"]=$_POST["plan"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Plan could not be updated";
		echo json_encode($response);
	}
?>