<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to assing pet to.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["owner_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no owner_id to verify previous pet ownership.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["pet_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pet_id to assign owner to.";
        echo json_encode($response);
        return;
    }
	$sel = $sqlConn->prepare("SELECT * FROM `spet_ownership` WHERE `pet_id` = ? AND `user_id` = ?");
	$sel->bind_param("ii",$_POST["pet_id"],$_POST["account_id"]);
	$sel->execute();
	$res=$sel->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="MISS";
		$response["message"]="User already registered as owner of the pet.";
		echo json_encode($response);
		exit();
	}
	
	$ins = $sqlConn->prepare("INSERT INTO `spet_ownership` (`pet_id`, `user_id`) VALUES (?, ?)");
	$ins->bind_param("ii",$_POST["pet_id"],$_POST["account_id"]);
	$ins->execute();
	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$response["status"]="GOOD";
		$response["pet_id"]=$_POST["pet_id"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Pet could not be assigned to user.";
		echo json_encode($response);
	}
?>