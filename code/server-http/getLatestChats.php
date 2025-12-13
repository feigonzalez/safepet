<?php
/*

// Esta sentencia SQL retorna el último mensaje de todas las conversaciones del usuario de id ${X}

SELECT m.*, (m.sender_id + m.receiver_id) AS pair_code
	FROM `spet_messages` m
    INNER JOIN ( 
        	SELECT MAX(`timestamp`) AS latest, (`sender_id` + `receiver_id`) AS pair_code
        	FROM `spet_messages`
        	WHERE `sender_id` = ${X} OR `receiver_id` = ${X}
        	GROUP BY pair_code
    	) d
        ON pair_code = d.pair_code AND m.timestamp = d.latest
    WHERE sender_id = ${X} OR receiver_id = ${X};
*/

	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();

    if(!isset($_POST["account_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no account_id to poll";
        echo json_encode($response);
        return;
    }

	// Get all conversations, even with users that are not registered
	$stmt = $sqlConn->prepare("SELECT m.*, (m.sender_id + m.receiver_id) AS pair_code, (m.sender_id + m.receiver_id - ?) AS partner_code, p.name AS partner_name
	FROM `spet_messages` m
    INNER JOIN ( 
        	SELECT MAX(`timestamp`) AS latest, (`sender_id` + `receiver_id`) AS pair_code
        	FROM `spet_messages`
        	WHERE `sender_id` = ? OR `receiver_id` = ?
        	GROUP BY pair_code
    	) d
        ON pair_code = d.pair_code AND m.timestamp = d.latest
    LEFT JOIN `spet_users` p
    	ON p.user_id = (m.sender_id + m.receiver_id - ?)
    WHERE sender_id = ? OR receiver_id = ?
	GROUP BY partner_code
	ORDER BY d.latest DESC;");

	$stmt->bind_param("iiiiii",$_POST["account_id"],$_POST["account_id"],$_POST["account_id"],$_POST["account_id"],$_POST["account_id"],$_POST["account_id"]);
	$stmt->execute();
	
	$res=$stmt->get_result();
	if($res->num_rows>0){
        $response["status"]="GOOD";
        $response["count"]=$res->num_rows;
        $index=0;
		while($row = $res->fetch_array()){
			$response["messages"][$index]["type"]=$row["type"];
			$response["messages"][$index]["content"]=$row["content"];
			$response["messages"][$index]["timestamp"]=$row["timestamp"];
			$response["messages"][$index]["inbound"]=($_POST["account_id"]==$row["receiver_id"]);
            $response["messages"][$index]["paircode"]=$row["pair_code"];
            $response["messages"][$index]["partner"]=$row["partner_name"];
            $index++;
		}
		$jsonResponse = json_encode($response , JSON_INVALID_UTF8_SUBSTITUTE);
        if($jsonResponse){
            echo $jsonResponse;
        } else {
            echo '{"status":"FAIL":"message":"JSON encoding failed : '.json_last_error_msg().' [code '.json_last_error().']"}';
        }
	} else {
		$response["status"]="MISS";
        $response["message"]="No chats for this account";
		echo json_encode($response);
	}
?>