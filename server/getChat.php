<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["pair_code"])){
        $response["status"]="FAIL";
        $response["message"]="There was no pair_code to get chats for.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to get chats for";
        echo json_encode($response);
        return;
    }
    if(intval($_POST["pair_code"])==0){
        $response["status"]="FAIL";
        $response["message"]="Invalid pair_code";
        echo json_encode($response);
        return;
    }
	
	$stmt = $sqlConn->prepare("SELECT * FROM `spet_messages` WHERE `sender_id` + `receiver_id`= ?");

	$pairCode = intval($_POST["pair_code"]);

	$stmt->bind_param("i",$pairCode);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
		$index=0;
		while($row = $res->fetch_array()){
			//$row["notification_id"] is the ID of the notification. Use it to delete it from the table after pulling
			$response[$index]["type"]=$row["type"];
			$response[$index]["content"]=$row["content"];
			$response[$index]["timestamp"]=$row["timestamp"];
			$response[$index]["inbound"]=($_POST["account_id"]==$row["receiver_id"]);
			$index++;
		}
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No messages in this chat";
		echo json_encode($response);
	}
?>