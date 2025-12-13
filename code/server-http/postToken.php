<?php
	require_once "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to store token for.";
        echo json_encode($response);
        return;
    }
	if(!isset($_POST["token"])){
		$response["status"]="FAIL";
		$response["message"]="There was no token to store.";
		echo json_encode($response);
		return;
	}

	$ins = $sqlConn->prepare("UPDATE `spet_users` SET `flow_token` = ? WHERE `user_id` = ?");
	$ins->bind_param("si",$_POST["token"],$_POST["account_id"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["account_id"]=$_POST["account_id"];
		$response["token"]=$_POST["token"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Token could not be stored.";
		echo json_encode($response);
	}
?>