<?php
//opcional: si se desea actualizar el plan de un usuario
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "sql.php"; // conexión mysqli en $sqlConn

// Validar parámetros
$src = $_SERVER['REQUEST_METHOD'] === 'GET' ? $_GET : $_POST;
if (!isset($src["idUsuario"]) && !isset($src["user_id"]) || !isset($src["plan"])) {
    echo json_encode([
        "success" => false,
        "error"   => "Faltan parámetros: idUsuario o plan"
    ]);
    exit();
}

$userId = isset($src["idUsuario"]) ? intval($src["idUsuario"]) : intval($src["user_id"]);
$planIn = strtolower(trim($src["plan"]));
if ($planIn === "free") $planIn = "gratis";
if ($planIn === "basic") $planIn = "basico";
if ($planIn === "premiun") $planIn = "premium";
$plan = $planIn; // gratis | basico | premium

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
