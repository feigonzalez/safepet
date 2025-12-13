<?php
	require_once "sql.php";
	
	function postChat($pairCode, $accountId, $type, $content, $timestamp){
		global $sqlConn;
		$ins = $sqlConn->prepare("INSERT INTO `spet_messages` (`sender_id`,`receiver_id`,`type`,`content`,`timestamp`) VALUES (?, ?, ?, ?, ?)");
		$rID = intval($pairCode) - intval($accountId);
		$ins->bind_param("iissi",$accountId,$rID,$type,$content,$timestamp);
		$ins->execute();

		$res=$ins->get_result();
		if(mysqli_affected_rows($sqlConn)>0 || !$res){
			return 1;
		} else {
			return 0;
		}
	}
?>