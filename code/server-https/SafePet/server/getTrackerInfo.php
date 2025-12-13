<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();

    if(isset($_POST["tracker_id"])){
		$stmt = $sqlConn->prepare("SELECT * FROM `spet_trackers` WHERE `tracker_id` = ?");
		$stmt->bind_param("i",$_POST["tracker_id"]);
    } else if(isset($_POST["pet_id"])){
		$stmt = $sqlConn->prepare("SELECT * FROM `spet_trackers` WHERE `pet_id` = ?");
		$stmt->bind_param("i",$_POST["pet_id"]);
	} else {
        $response["status"]="FAIL";
        $response["message"]="There was no tracker_id nor pet_id to poll";
        echo json_encode($response);
        return;
	}

	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
		while($row = $res->fetch_array()){
			//$row["tracker_id"] is the ID of the tracker.
            //A single tracker is expected to be found: Response properties are overwritten
			$response["status"]="GOOD";
			$response["tracker_id"]=$row["tracker_id"];
			$response["pet_id"]=$row["pet_id"];
			$response["latitude"]=$row["latitude"];
			$response["longitude"]=$row["longitude"];
			$response["last_reading"]=$row["last_reading"];
		}
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No tracker found with given tracker_id or pet_id";
		echo json_encode($response);
	}
?>