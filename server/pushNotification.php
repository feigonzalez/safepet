<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to push notification to.";
        echo json_encode($response);
        return;
    }

	$ins = $sqlConn->prepare("INSERT INTO `spet_notifications` (`account_id`,`title`,`description`,`type`) VALUES (?, ?, ?, ?)");
	$ins->bind_param("isss",$_POST["account_id"],$_POST["title"],$_POST["description"],$_POST["type"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["account_id"]=$_POST["account_id"];
		$response["title"]=$_POST["title"];
		$response["description"]=$_POST["description"];
		$response["type"]=$_POST["type"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
        $response["message"]="Notification could not be pushed.";
		echo json_encode($response);
	}
?>