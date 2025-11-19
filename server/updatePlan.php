<?php
//opcional: si se desea actualizar el plan de un usuario
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "sql.php"; // conexión mysqli en $sqlConn

// Validar parámetros
if (!isset($_POST["idUsuario"]) || !isset($_POST["plan"])) {
    echo json_encode([
        "success" => false,
        "error"   => "Faltan parámetros: idUsuario o plan"
    ]);
    exit();
}

$userId = intval($_POST["idUsuario"]);
$plan   = strtolower(trim($_POST["plan"])); // gratis | basico | premium

// Validar plan permitido
$planesValidos = ["gratis", "basico", "premium"];

if (!in_array($plan, $planesValidos)) {
    echo json_encode([
        "success" => false,
        "error"   => "Plan no válido"
    ]);
    exit();
}

// Actualizar BD
$stmt = $sqlConn->prepare("UPDATE `spet_users` 
                           SET `plan` = ? 
                           WHERE `user_id` = ?");
$stmt->bind_param("si", $plan, $userId);
$ok = $stmt->execute();

echo json_encode([
    "success" => $ok,
    "updated_plan" => $plan,
    "user_id" => $userId
]);
?>
