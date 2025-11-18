<?php
	require_once "sql.php";
	function pushNotification($account_id, $title, $description, $type){
		global $sqlConn;
		$timestamp = strtotime(date("Y-m-d H:i:s"));

		$ins = $sqlConn->prepare("INSERT INTO `spet_notifications` (`account_id`,`title`,`description`,`type`, `timestamp`) VALUES (?, ?, ?, ?, ?)");
		$ins->bind_param("isssi",$account_id,$title,$description,$type, $timestamp);
		$ins->execute();

		$res=$ins->get_result();
		if(mysqli_affected_rows($sqlConn)>0 || !$res){
			return 1;
		}
		return 0;
	}
?>