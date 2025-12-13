<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["username"])){
        $response["status"]="FAIL";
        $response["message"]="There was no username to register.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["password"])){
        $response["status"]="FAIL";
        $response["message"]="There was no password to register.";
        echo json_encode($response);
        return;
    }
	
	// Verify that account doesn't already exist
	$sel = $sqlConn->prepare("SELECT * FROM `spet_users` WHERE `username` = ?");
	$sel->bind_param("s",$_POST["username"]);
	$sel->execute();
	$res=$sel->get_result();
	// If num_rows > 0, an user with that username already exists.
	if($res->num_rows>0){
		$response["status"]="MISS";
		$response["message"]="User with given username already registered.";
		echo json_encode($response);
	} else {
		$passHash = password_hash($_POST["password"],PASSWORD_BCRYPT);
		$plan = 'free';
		if(isset($_POST["plan"])){
			$p = strtolower(trim($_POST["plan"]));
			if($p === 'gratis') $p = 'free';
			if($p === 'basico') $p = 'basic';
			if(in_array($p, ['free','basic','premium'])) $plan = $p;
		}
		$ins = $sqlConn->prepare("INSERT INTO `spet_users` (`username`,`password`, `name`, `plan`) VALUES (?, ?, ?, ?)");
		$ins->bind_param("ssss",$_POST["username"],$passHash,$_POST["name"],$plan);
		$ins->execute();
		$insID=$sqlConn->insert_id;

		$res=$ins->get_result();
		if(mysqli_affected_rows($sqlConn)>0 || !$res){
			$response["status"]="GOOD";
			$response["account_id"]=$insID;
			$response["username"]=$_POST["username"];
			$response["name"]=$_POST["name"];
			$response["plan"]=$plan;
			echo json_encode($response);
		} else {
			$response["status"]="FAIL";
			$response["message"]="User could not be registered.";
			echo json_encode($response);
		}
	}
?>
