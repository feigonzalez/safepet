<?php
	include "sql.php";
	include "crypto.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
	
	// Prevents warnings from being printed into the response.
	// Added specifically because of the warnings that rise when
	// mysqli's bind_param is used with call_user_func_array, since
	// bind_param expects parameters passed by reference but call_user_func_array
	// doesn't do that >:c
	error_reporting(E_ERROR | E_PARSE);

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
    if(!isset($_POST["latitude"]) || !isset($_POST["longitude"])){
        $response["status"]="FAIL";
        $response["message"]="There was no location data (latitude and/or longitude) to poll";
        echo json_encode($response);
        return;
    }
	
	$params = Array("dd",$_POST["latitude"], $_POST["longitude"]);
	$stmt = "SELECT * FROM `spet_alerts` a JOIN `spet_pets` p ON a.pet_id = p.pet_id WHERE ABS(`latitude` - ?) < 0.1 AND ABS(`longitude` - ?) < 0.1";
	
	if(isset($_POST["petSpecies"]) && strcmp(trim($_POST["petSpecies"]),"")!=0){
		array_push($params,$_POST["petSpecies"]);
		$params[0] = $params[0]."s";
		$stmt = $stmt." AND `species` = ?";
	}
	if(isset($_POST["petBreed"]) && strcmp(trim($_POST["petBreed"]),"")!=0){
		array_push($params,$_POST["petBreed"]);
		$params[0] = $params[0]."s";
		$stmt = $stmt." AND `breed` = ?";
	}
	if(isset($_POST["petColor"]) && strcmp(trim($_POST["petColor"]),"")!=0){
		array_push($params,$_POST["petColor"]);
		$params[0] = $params[0]."s";
		$stmt = $stmt." AND `color` = ?";
	}
	if(isset($_POST["petSex"]) && strcmp(trim($_POST["petSex"]),"")!=0){
		array_push($params,$_POST["petSex"]);
		$params[0] = $params[0]."s";
		$stmt = $stmt." AND `sex` = ?";
	}
	
	//$response=Array($params, $stmt);
	//echo json_encode($response);
	
	$sel = $sqlConn->prepare($stmt);
	call_user_func_array(Array($sel,"bind_param"),$params);
	$sel->execute();
	
	$res=$sel->get_result();
	if($res->num_rows>0){
        $index=0;
		while($row = $res->fetch_array()){
			//$row["notification_id"] is the ID of the notification. Use it to delete it from the table after pulling
			$response[$index]["emitter_id"]=$row["emitter_id"];
			$response[$index]["pet_id"]=$row["pet_id"];
			$response[$index]["timestamp"]=$row["timestamp"];
			$response[$index]["latitude"]=$row["latitude"];
			$response[$index]["longitude"]=$row["longitude"];
			$response[$index]["petName"]=$row["name"];
			$response[$index]["petSpecies"]=$row["species"];
			$response[$index]["petBreed"]=$row["breed"];
			$response[$index]["petSex"]=$row["sex"];
            $index++;
		}
		echo json_encode($response);
	} else {
		$response["status"]="MISS";
        $response["message"]="No alerts found";
		echo json_encode($response);
	} //*/
?>