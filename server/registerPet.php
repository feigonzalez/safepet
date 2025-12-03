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
    if(!isset($_POST["petName"]) || !isset($_POST["petSpecies"]) || !isset($_POST["petColor"]) || !isset($_POST["petSex"])){
        $response["status"]="FAIL";
        $response["message"]="There was missing pet data and couldn't register.";
        echo json_encode($response);
        return;
    }
//limitaciones
    $planSel = $sqlConn->prepare("SELECT `plan` FROM `spet_users` WHERE `user_id` = ?");
    $planSel->bind_param("i", $_POST["account_id"]);
    $planSel->execute();
    $planRes = $planSel->get_result();
    $userPlan = 'free';
    if($planRes && $row = $planRes->fetch_array()){
        $p = strtolower(trim($row["plan"]));
        if($p === 'gratis') $p = 'free';
        if($p === 'basico') $p = 'basic';
        $userPlan = $p;
    }
    if($userPlan === 'free'){
        $cntSel = $sqlConn->prepare("SELECT COUNT(*) AS c FROM `spet_ownership` WHERE `user_id` = ?");
        $cntSel->bind_param("i", $_POST["account_id"]);
        $cntSel->execute();
        $cntRes = $cntSel->get_result();
        $c = 0;
        if($cntRes && $rc = $cntRes->fetch_array()) $c = intval($rc["c"]);
        if($c >= 1){
            $response["status"] = "MISS";
            $response["message"] = "Pet limit reached for free plan";
            echo json_encode($response);
            return;
        }
    }

	$ins = $sqlConn->prepare("INSERT INTO `spet_pets` (`name`,`species`, `breed`, `color`, `sex`, `status`) VALUES (?, ?, ?, ?, ?, 'HOME')");
	$ins->bind_param("sssss",$_POST["petName"],$_POST["petSpecies"],$_POST["petBreed"],$_POST["petColor"],$_POST["petSex"]);
	$ins->execute();
	$insID=$sqlConn->insert_id;

	$res=$ins->get_result();
	if(mysqli_affected_rows($sqlConn)>0 || !$res){
		$ins = $sqlConn->prepare("INSERT INTO `spet_ownership` (`pet_id`, `user_id`) VALUES (?, ?)");
		$ins->bind_param("ii",$insID,$_POST["account_id"]);
		$ins->execute();
		$res=$ins->get_result();
		if(mysqli_affected_rows($sqlConn)>0 || !$res){
			$response["status"]="GOOD";
			$response["name"]=$_POST["petName"];
			$response["pet_id"]=$insID;
			echo json_encode($response);
		} else {
			$response["status"]="FAIL";
			$response["message"]="Pet could not be assigned to user.";
			echo json_encode($response);
		}
	} else {
		$response["status"]="FAIL";
		$response["message"]="Pet could not be registered.";
		echo json_encode($response);
	}
?>
