<?php
	require_once "sql.php";
	require_once "functions/pushNotification.php";	//pushNotification($uID, $title, $description, $type)
	header('Content-type: application/json');
	header('Access-Control-Allow-Origin: *');
	$response=array();
	
    if(!isset($_POST["tracker_id"])){
        $response["status"]="FAIL";
        $response["message"]="There was no tracker_id to update info of.";
        echo json_encode($response);
        return;
    }
	
	//echo "[!] tracker_id : [".$_POST["tracker_id"]."]\n";

	$timestamp = strtotime(date("Y-m-d H:i:s"));

	// obtener los datos actuales del tracker
	$trackerData = selectSingle("spet_trackers","tracker_id",$_POST["tracker_id"]);
	
	// get pet data
	$pet = selectSingle("spet_pets","pet_id",$trackerData["pet_id"]);
	
	//echo "[!] trackerData: [".(count($trackerData)/2)."] fields\n";
	// si el tracker existe...
	if(!empty($trackerData)){
		
		// se determina si está definida la zona segura
		if(isset($trackerData["safezone_radius"]) && !empty($trackerData["safezone_radius"]) && intval($trackerData["safezone_radius"])>0){
			//echo "[!] safe zone set: \n";
			//echo "      lat: ".$trackerData["safezone_latitude"]."\n";
			//echo "      lng: ".$trackerData["safezone_longitude"]."\n";
			//echo "      rds: ".$trackerData["safezone_radius"]."\n";
			// se encuentra la distancia, en metros, entre la ubicación del tracker y el centro de la zona segura
			$distance = distanceGeo(
				floatval($_POST["latitude"]),floatval($_POST["longitude"]),
				floatval($trackerData["safezone_latitude"]),floatval($trackerData["safezone_longitude"]));
			// si la distancia es mayor al radio de la zona segura, la mascota se encuentra fuera de ella
			//echo "[!] distance to safe zone center: [".$distance."]\n";
			if($distance > intval($trackerData["safezone_radius"])){
				//echo "[!] tracker outside safe zone.\n";
				
				// si el estado de la mascota no es "AWAY"
				if(strcmp($pet["status"],"AWAY")!=0){
					// se actualiza el estado a "AWAY"
					updateField("spet_pets","status","AWAY","s","pet_id",$trackerData["pet_id"]);
					//echo "[!] pet data: [".(count($pet)/2)."] fields\n";
					$owners = selectMany("spet_ownership","pet_id",$trackerData["pet_id"]);
					//echo "[!] owners: [".$owners->num_rows."] \n";
					// se buscan a todos los dueños de esta mascota
					if($owners->num_rows > 0){
						while($row = $owners->fetch_array()){
							//echo "[!]     owner[".$row["user_id"]."] of pet[".$row["pet_id"]."]\n";
							// enviar una notificacion a cada dueño
							pushNotification($row["user_id"],
								"Tu mascota, ".$pet["name"].", ha salido de la zona segura",
								"Ve a los detalles de tu mascota para poder ver su ubicación actual",
								"warning");
						}
					}
				} else {
					// echo "[!] notifications already sent"
				}
			} else {
				// si la mascota ya estaba registrada como Fuera de la zona segura, pero ahora está adentro, se actualiza su estado a "HOME"
				if(strcmp($pet["status"],"HOME")!=0){
					updateField("spet_pets","status","HOME","s","pet_id",$trackerData["pet_id"]);
				}
			}
		} else {
			// echo "[!] no safe zone for this tracker\n";
		}
		
		$ins = $sqlConn->prepare("UPDATE `spet_trackers` SET
			`latitude` = ?,
			`longitude` = ?,
			`last_reading` = ?,
			`accuracy` = ?,
			`battery` = ?
			WHERE `tracker_id` = ?");
		$ins->bind_param("ddiddi",$_POST["latitude"],$_POST["longitude"],$timestamp,$_POST["accuracy"],$_POST["battery"],$_POST["tracker_id"]);
		$ins->execute();

		$res=$ins->get_result();
		if(mysqli_affected_rows($sqlConn)>0 || !$res){
			$response["status"]="GOOD";
			$response["tracker_id"]=$_POST["tracker_id"];
			$response["latitude"]=$_POST["latitude"];
			$response["longitude"]=$_POST["longitude"];
			$response["battery"]=$_POST["battery"];
			$response["accuracy"]=$_POST["accuracy"];
			echo json_encode($response);
		} else {
			$response["status"]="FAIL";
			$response["message"]="Tracker info could not be updated.";
			echo json_encode($response);
		}
		
	} else {
		$response["status"]="MISS";
		$response["message"]="No tracker with given tracker_id found.";
		echo json_encode($response);
	}
	
	function distanceGeo($lat1, $lon1, $lat2, $lon2){
		$R = 6371e3; // Radius of Earth, in meters
		$d1 = $lat1 * M_PI/180; //
		$d2 = $lat2 * M_PI/180;
		$Dd = ($lat2-$lat1) * M_PI/180;
		$Dl = ($lon2-$lon1) * M_PI/180;

		$a = sin($Dd/2) * sin($Dd/2)  +  cos($d1) * cos($d2) * sin($Dl/2) * sin($Dl/2);
		$c = 2 * atan2(sqrt($a), sqrt(1-$a));
		$d = $R * $c; // in metres
		return $d;
	}
?>