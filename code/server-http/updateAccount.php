<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to update.";
        echo json_encode($response);
        return;
    }
	
	$stmt = $sqlConn->prepare("UPDATE `spet_users` SET `name` = ?, `phone` = ? WHERE `user_id` = ?");
	$stmt->bind_param("ssi",$_POST["fullName"],$_POST["phone"],$_POST["account_id"]);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["account_id"]=$_POST["account_id"];
		$response["fullName"]=$_POST["fullName"];
		$response["phone"]=$_POST["phone"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
        $response["message"]="Account data could not be updated.";
		echo json_encode($response);
	}
?>