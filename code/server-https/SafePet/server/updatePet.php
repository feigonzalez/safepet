<?php
	include "sql.php";
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response = array();

	if (!isset($_POST["pet_id"])) {
		$response["status"] = "FAIL";
		$response["message"] = "Missing pet_id.";
		echo json_encode($response);
		return;
	}

	if (!isset($_POST["petName"])) {
		$response["status"] = "FAIL";
		$response["message"] = "Missing data to update.";
		echo json_encode($response);
		return;
	}

	$petId    = $_POST["pet_id"];
	$petName  = $_POST["petName"];
	$petBreed = isset($_POST["petBreed"]) ? $_POST["petBreed"] : "";
	$petColor = isset($_POST["petColor"]) ? $_POST["petColor"] : "";

	// IMPORTANTE: species y sex NO se actualizan

	$stmt = $sqlConn->prepare("
		UPDATE `spet_pets`
		SET `name` = ?, `breed` = ?, `color` = ?
		WHERE `pet_id` = ?
	");

	if (!$stmt) {
		$response["status"] = "FAIL";
		$response["message"] = "SQL prepare error.";
		echo json_encode($response);
		return;
	}

	$stmt->bind_param("sssi", $petName, $petBreed, $petColor, $petId);

	if ($stmt->execute()) {
		$response["status"] = "GOOD";
		$response["pet_id"]  = $petId;
		$response["name"]    = $petName;
		$response["breed"]   = $petBreed;
		$response["color"]   = $petColor;
		echo json_encode($response);
	} else {
		$response["status"] = "FAIL";
		$response["message"] = "Update failed.";
		echo json_encode($response);
	}
?>
