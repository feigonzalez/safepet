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
	
	// Only messages created after $timetamp will be returned.
    if(!isset($_POST["timestamp"])){
		$timestamp = 0;
    } else {
		$timestamp = intval($_POST["timestamp"]);
	}
	
	$stmt = $sqlConn->prepare("SELECT m.*, u.name FROM `spet_messages` m
		JOIN `spet_users` u ON `user_id` = (? - ?) WHERE `sender_id` + `receiver_id`= ? AND `timestamp` > ?;");

	$pairCode = intval($_POST["pair_code"]);

	$stmt->bind_param("iiii",$pairCode,$_POST["account_id"],$pairCode,$timestamp);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
		$index=0;
		$response["status"]="GOOD";
		$response["messages"]=Array();
		while($row = $res->fetch_array()){
			//$row["name"] is the name of chat partner. It gets overwritten for each mesasge which isn't ideal but it works :/
			$response["pairName"]=$row["name"];
			//$row["notification_id"] is the ID of the notification. Use it to delete it from the table after pulling
			$response["messages"][$index]["type"]=$row["type"];
			$response["messages"][$index]["content"]=$row["content"];
			$response["messages"][$index]["timestamp"]=$row["timestamp"];
			$response["messages"][$index]["inbound"]=($_POST["account_id"]==$row["receiver_id"]);
			$index++;
		}
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No messages in this chat";
		echo json_encode($response);
	}
?>