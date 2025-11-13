<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["tracker_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no tracker_id to update info of.";
        echo json_encode($response);
        return;
    }

	$ins = $sqlConn->prepare("UPDATE `spet_trackers` SET `latitude` = ?, `longitude` = ? WHERE `tracker_id` = ?");
	$ins->bind_param("ddi",$_POST["latitude"],$_POST["longitude"],$_POST["tracker_id"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["tracker_id"]=$_POST["tracker_id"];
		$response["latitude"]=$_POST["latitude"];
		$response["longitude"]=$_POST["longitude"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
        $response["message"]="Tracker info could not be updated.";
		echo json_encode($response);
	}
?>