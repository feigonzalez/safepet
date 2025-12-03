<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to assing tracker to.";
        echo json_encode($response);
        return;
    }
	if(!isset($_POST["tracker_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no tracker_id to assing to pet.";
        echo json_encode($response);
        return;
    }
    
    $planSel = $sqlConn->prepare("SELECT u.`plan` FROM `spet_ownership` o JOIN `spet_users` u ON o.`user_id` = u.`user_id` WHERE o.`pet_id` = ? LIMIT 1");
    $planSel->bind_param("i", $_POST["pet_id"]);
    $planSel->execute();
    $planRes = $planSel->get_result();
    $petPlan = 'free';
    if($planRes && $rowPlan = $planRes->fetch_array()){
        $p = strtolower(trim($rowPlan["plan"]));
        if($p === 'gratis') $p = 'free';
        if($p === 'basico') $p = 'basic';
        $petPlan = $p;
    }
    if($petPlan !== 'premium'){
        $response["status"] = "MISS";
        $response["message"] = "Tracker requires premium plan";
        echo json_encode($response);
        return;
    }

    // Check if the tracker is already in use. If it is, it can't be registered.
    $sel = $sqlConn->prepare("SELECT * FROM `spet_trackers` WHERE `tracker_id` = ?");
	$sel->bind_param("i",$_POST["tracker_id"]);
	$sel->execute();
	$res=$sel->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="MISS";
		$response["message"]="Tracker already in use";
		echo json_encode($response);
		exit();
	}
	
	// Tracker was not in use. Assign to indicated pet
	$ins = $sqlConn->prepare("INSERT INTO `spet_trackers` (`tracker_id`, `pet_id`) VALUES (?, ?)");
	$ins->bind_param("ii",$_POST["tracker_id"],$_POST["pet_id"]);
	$ins->execute();

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["tracker_id"]=$_POST["tracker_id"];
		$response["pet_id"]=$_POST["pet_id"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Tracker could not be registered";
		echo json_encode($response);
	}
?>
