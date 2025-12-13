<?php
	require_once "sql.php";
	require_once "functions/postChat.php";
	
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	//var_dump($_POST);
	$response=array();
	if(!isset($_POST["pair_code"])){
		$response["status"]="FAIL";
		$response["message"]="There was no pair_code to assing chats for.";
		echo json_encode($response);
		return;
	}
	if(!isset($_POST["account_id"])){
		$response["status"]="FAIL";
		$response["message"]="There was no account_id to assign message to";
		echo json_encode($response);
		return;
	}
	if(intval($_POST["pair_code"])==0){
		$response["status"]="FAIL";
		$response["message"]="Invalid pair_code";
		echo json_encode($response);
		return;
	}
	
	if(postChat($_POST["pair_code"], $_POST["account_id"], $_POST["type"], $_POST["content"], $_POST["timestamp"])==1){
		$response["status"]="GOOD";
		$response["type"]=$_POST["type"];
		$response["content"]=$_POST["content"];
		$response["timestamp"]=$_POST["timestamp"];
		echo json_encode($response);
	} else {
		$response["status"]="FAIL";
		$response["message"]="Message could not be posted.";
		echo json_encode($response);
		
	}
?>