<?php
	include "sql.php";
	include "crypto.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();

	if(isset($_POST["responseKey"])){
        $oPublic = openssl_get_publickey($_POST["responseKey"]);
        $oPrivate = openssl_get_privatekey($PRIVATE_KEY);
        $decrypted="";
        openssl_private_decrypt($_POST["body"],$decrypted,$oPrivate,OPENSSL_PKCS1_PADDING);
       	$response["status"]="OKAY";
        $response["key"]=$_POST["responseKey"];
        //$response["data"]=$decrypted;
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to poll";
        echo json_encode($response);
        return;
    }
	$timestamp = 0;
	if(isset($_POST["timestamp"]) && is_numeric($_POST["timestamp"]))
		$timestamp = $_POST["timestamp"];

	$stmt = $sqlConn->prepare("SELECT * FROM `spet_notifications` WHERE `account_id` = ? AND `timestamp` > ? ORDER BY `timestamp` DESC");

	$stmt->bind_param("ii",$_POST["account_id"],$timestamp);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
        $noteIndex=0;
		$response["status"]="GOOD";
		$response["notifications"]=array();
		while($row = $res->fetch_array()){
			$response["notifications"][$noteIndex]=array();
			//$row["notification_id"] is the ID of the notification. Use it to delete it from the table after pulling
			$response["notifications"][$noteIndex]["id"]=$row["notification_id"];
			$response["notifications"][$noteIndex]["title"]=$row["title"];
			$response["notifications"][$noteIndex]["description"]=$row["description"];
			$response["notifications"][$noteIndex]["type"]=$row["type"];
			$response["notifications"][$noteIndex]["timestamp"]=$row["timestamp"];
            $noteIndex++;
		}
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No notifications for this account";
		echo json_encode($response);
	}
?>