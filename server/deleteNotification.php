<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["notification_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no notification_id to delete.";
        echo json_encode($response);
        return;
    }

	$del = $sqlConn->prepare("DELETE FROM `spet_notifications` WHERE `notification_id` = ?");
	$del->bind_param("i",$_POST["notification_id"]);
	$del->execute();

	$res=$del->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Notification could not be deleted.";
		echo json_encode($response);
	}
?>