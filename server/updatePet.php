<?php
    include "sql.php";
    header('Content-type: application/json');
    header('Access-Control-Allow-Origin: *');
    $response = array();

    if (!isset($_POST["pet_id"])) {
        $response["status"] = "FAIL";
        $response["message"] = "There was no pet_id to update.";
        echo json_encode($response);
        return;
    }

    if (!isset($_POST["petName"]) || !isset($_POST["petColor"])) {
        $response["status"] = "FAIL";
        $response["message"] = "There was missing pet data and it couldn't be updated.";
        echo json_encode($response);
        return;
    }

    $petId    = $_POST["pet_id"];
    $petName  = $_POST["petName"];
    $petColor = $_POST["petColor"];
    $petBreed = isset($_POST["petBreed"]) ? $_POST["petBreed"] : "";

    // NO actualizar species ni sex
    $stmt = $sqlConn->prepare("
        UPDATE `spet_pets`
        SET `name` = ?, `breed` = ?, `color` = ?
        WHERE `pet_id` = ?
    ");

    if (!$stmt) {
        $response["status"] = "FAIL";
        $response["message"] = "Error preparing SQL statement.";
        echo json_encode($response);
        return;
    }

    $stmt->bind_param("sssi", $petName, $petBreed, $petColor, $petId);
    $stmt->execute();

    $res = $stmt->get_result();

    if (mysqli_affected_rows($sqlConn) > 0 || !$res) {
        $response["status"] = "GOOD";
        $response["pet_id"] = $petId;
        $response["name"] = $petName;
        $response["breed"] = $petBreed;
        $response["color"] = $petColor;
        echo json_encode($response);
    } else {
        $response["status"] = "FAIL";
        $response["message"] = "Pet data could not be updated.";
        echo json_encode($response);
    }
?>
