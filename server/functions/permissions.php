<?php
  // Utilidades de permisos y validaciones reutilizables.
  // Debe incluirse DESPUÉS de "sql.php" para tener $sqlConn disponible.

  function sp_normalize_plan($plan){
    $p = strtolower(trim($plan ?? 'free'));
    if($p === 'gratis') return 'free';
    if($p === 'basico') return 'basic';
    if($p === 'premium') return 'premium';
    if($p === 'free') return 'free';
    if($p === 'basic') return 'basic';
    return $p; // valor por defecto
  }

  function sp_get_user_plan($account_id){
    global $sqlConn;
    $stmt = $sqlConn->prepare("SELECT `plan` FROM `spet_users` WHERE `user_id` = ? LIMIT 1");
    $stmt->bind_param("i", $account_id);
    $stmt->execute();
    $res = $stmt->get_result();
    if($res && ($row = $res->fetch_assoc())){
      return sp_normalize_plan($row['plan']);
    }
    return null;
  }

  function sp_is_premium($account_id){
    $plan = sp_get_user_plan($account_id);
    return $plan === 'premium';
  }

  function sp_owns_pet($account_id, $pet_id){
    global $sqlConn;
    $own = $sqlConn->prepare("SELECT 1 FROM `spet_ownership` WHERE `pet_id` = ? AND `user_id` = ? LIMIT 1");
    $own->bind_param("ii", $pet_id, $account_id);
    $own->execute();
    $res = $own->get_result();
    return ($res && $res->fetch_assoc()) ? true : false;
  }

  // Devuelve array [allowed => bool, message => string]
  function sp_enforce_pet_limit($account_id){
    global $sqlConn;
    $plan = sp_get_user_plan($account_id) ?? 'free';
    $cnt = $sqlConn->prepare("SELECT COUNT(*) as c FROM `spet_ownership` WHERE `user_id` = ?");
    $cnt->bind_param("i", $account_id);
    $cnt->execute();
    $cRes = $cnt->get_result();
    $ownCount = 0;
    if($cRes && ($cRow = $cRes->fetch_assoc())) $ownCount = intval($cRow['c']);

    if($plan === 'free' && $ownCount >= 1){
      return array(
        'allowed' => false,
        'message' => 'El plan gratuito permite registrar sólo 1 mascota.'
      );
    }
    return array('allowed' => true, 'message' => '');
  }
?>