<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();

    if(!isset($_POST["tracker_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no tracker_id to poll";
        echo json_encode($response);
        return;
    }

	$stmt = $sqlConn->prepare("SELECT * FROM `spet_trackers` WHERE `tracker_id` = ?");

	$stmt->bind_param("i",$_POST["tracker_id"]);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
		while($row = $res->fetch_array()){
			//$row["tracker_id"] is the ID of the tracker.
            //A single tracker is expected to be found: Response properties are overwritten
			$response["latitude"]=$row["latitude"];
			$response["longitude"]=$row["longitude"];
			$response["last_reading"]=$row["last_reading"];
		}
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No tracker found with given tracker_id";
		echo json_encode($response);
	}
?>