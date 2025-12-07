<?php
	require_once "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to get token from.";
        echo json_encode($response);
        return;
    }

	$ins = $sqlConn->prepare("SELECT `flow_token` FROM `spet_users` WHERE `user_id` = ?");
	$ins->bind_param("i",$_POST["account_id"]);
	$ins->execute();

	$res=$ins->get_result();
	if($res->num_rows>0){
		$row = $res->fetch_array();
		if(empty($row["flow_token"])){
			$response["status"]="MISS";
			$response["message"]="No token set for this account";
			echo json_encode($response);
		} else {
			$response["status"]="GOOD";
			$response["account_id"]=$_POST["account_id"];
			$response["token"]=$row["flow_token"];
			echo json_encode($response);
		}
	} else {
		$response["status"]="FAIL";
		$response["message"]="Token could not be retrieved.";
		echo json_encode($response);
	}
?>