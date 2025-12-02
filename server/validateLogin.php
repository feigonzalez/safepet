<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["username"])){
        $response["status"]="FAIL";
        $response["message"]="There was no username to validate.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["password"])){
        $response["status"]="FAIL";
        $response["message"]="There was no password to validate.";
        echo json_encode($response);
        return;
    }
	
	$stmt = $sqlConn->prepare("SELECT * FROM `spet_users` WHERE `username` = ?");
	$stmt->bind_param("s",$_POST["username"]);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
		$row = $res->fetch_array();
		if(password_verify($_POST["password"],$row["password"])){
			//$row["notification_id"] is the ID of the notification. Use it to delete it from the table after pulling
			$response["status"]="GOOD";
			$response["account_id"]=$row["user_id"];
			$response["name"]=$row["name"];
			if (isset($row["phone"]) && $row["phone"] !== '') { $response["phone"]=$row["phone"]; }
			$response["email"]=$row["username"];
            $p = strtolower(trim($row["plan"]));
            if($p === 'gratis') $p = 'free';
            if($p === 'basico') $p = 'basic';
            $response["plan"]=$p;
            echo json_encode($response);
		} else {
			$response["status"]="MISS";
			$response["message"]="Incorrect password";
			echo json_encode($response);
		}
	} else {
		$response["status"]="MISS";
        $response["message"]="No user with given username and password found.";
		echo json_encode($response);
	}
?>
