<?php
// Devuelve la información de la cuenta (incluye plan) por account_id
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$response = [];

if (!isset($_POST['account_id'])) {
    $response['status'] = 'FAIL';
    $response['message'] = 'Falta account_id';
    echo json_encode($response);
    exit;
}

$accountId = intval($_POST['account_id']);

// Incluye la conexión SQL (debe existir en el servidor destino)
// Nota: en este repo puede no estar presente; en producción sí.
include_once __DIR__ . '/sql.php';

if (!isset($sqlConn) || !$sqlConn) {
    $response['status'] = 'FAIL';
    $response['message'] = 'No hay conexión a BD';
    echo json_encode($response);
    exit;
}

$stmt = $sqlConn->prepare('SELECT user_id, name, username, phone, plan FROM spet_users WHERE user_id = ?');
if (!$stmt) {
    $response['status'] = 'FAIL';
    $response['message'] = 'No se pudo preparar consulta';
    echo json_encode($response);
    exit;
}
$stmt->bind_param('i', $accountId);
$stmt->execute();
$res = $stmt->get_result();

if ($res && $res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $response['status'] = 'GOOD';
    $response['account'] = [
        'user_id' => intval($row['user_id']),
        'name'    => $row['name'],
        'email'   => $row['username'],
        'phone'   => isset($row['phone']) ? $row['phone'] : '',
        'plan'    => isset($row['plan']) ? strtolower($row['plan']) : 'free',
    ];
} else {
    $response['status'] = 'MISS';
    $response['message'] = 'No se encontró la cuenta';
}

echo json_encode($response);
?>

