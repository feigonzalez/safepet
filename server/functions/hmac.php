<?php
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
    if(!isset($_POST["key"])){
        $response["status"]="FAIL";
        $response["message"]="There was no key to hash with.";
        echo json_encode($response);
        return;
    }
    if(!isset($_POST["message"])){
        $response["status"]="FAIL";
        $response["message"]="There was no message to hash";
        echo json_encode($response);
        return;
    }
	
	$response["status"]="GOOD";
	$response["hash"]=hash_hmac("sha256", $_POST["message"], $_POST["key"]);
    echo json_encode($response);
?>