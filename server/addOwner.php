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

    $ownCntSel = $sqlConn->prepare("SELECT COUNT(*) AS c FROM `spet_ownership` WHERE `pet_id` = ?");
    $ownCntSel->bind_param("i", $_POST["pet_id"]);
    $ownCntSel->execute();
    $ownCntRes = $ownCntSel->get_result();
    $ownersCount = 0;
    if($ownCntRes && $rc = $ownCntRes->fetch_array()) $ownersCount = intval($rc["c"]);
    if($ownersCount >= 1){
        $planSel = $sqlConn->prepare("SELECT u.`plan` FROM `spet_ownership` o JOIN `spet_users` u ON o.`user_id` = u.`user_id` WHERE o.`pet_id` = ? LIMIT 1");
        $planSel->bind_param("i", $_POST["pet_id"]);
        $planSel->execute();
        $planRes = $planSel->get_result();
        $petPlan = 'free';
        if($planRes && $row = $planRes->fetch_array()){
            $p = strtolower(trim($row["plan"]));
            if($p === 'gratis') $p = 'free';
            if($p === 'basico') $p = 'basic';
            $petPlan = $p;
        }
        if($petPlan === 'free'){
            $response["status"] = "MISS";
            $response["message"] = "Multiple owners not allowed for free plan";
            echo json_encode($response);
            exit();
        }
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
