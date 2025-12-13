<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once("../sql.php");

$sharedSecret = "SPET_SHARED_SECRET_2025";

$userId = intval($_POST["user_id"] ?? 0);
$planIn = strtolower(trim($_POST["plan"] ?? ""));
$status = strtolower(trim($_POST["status"] ?? ""));
$token  = $_POST["token"] ?? "";
$sig    = $_POST["sig"] ?? "";

if(!$userId || !$planIn || !$status || !$token || !$sig){
  echo json_encode(["success"=>false,"error"=>"Faltan parámetros"]);
  exit();
}

// Normalización
$plan = $planIn;
if ($plan === "gratis") { $plan = "free"; }
if ($plan === "basico") { $plan = "basic"; }
$valid = ["free","basic","premium"];
if(!in_array($plan,$valid)){
  echo json_encode(["success"=>false,"error"=>"Plan inválido"]);
  exit();
}

// Verificar firma
$payload = $userId."|".$plan."|".$status."|".$token";
$expected = hash_hmac("sha256",$payload,$sharedSecret);
if(!hash_equals($expected,$sig)){
  echo json_encode(["success"=>false,"error"=>"Firma inválida"]);
  exit();
}

// Solo actualizar en éxito
if($status === "paid"){
  $stmt = $sqlConn->prepare("UPDATE `spet_users` SET `plan` = ? WHERE `user_id` = ?");
  $stmt->bind_param("si",$plan,$userId);
  $ok = $stmt->execute();
  echo json_encode(["success"=>$ok,"updated_plan"=>$plan,"user_id"=>$userId]);
} else {
  echo json_encode(["success"=>false,"error"=>"Pago rechazado","user_id"=>$userId]);
}