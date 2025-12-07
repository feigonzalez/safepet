<?php

	require_once "../sql.php";

	$content="\n= POST =\n";
	forEach($_POST as $k => $v){
		$content.="\n".$k." => ".$v;
	}
	$content.="\n= GET =\n";
	forEach($_GET as $k => $v){
		$content.="\n".$k." => ".$v;
	}
	file_put_contents("./confirmPaymentLog.txt",$content);

	$ins = $sqlConn->prepare("UPDATE `spet_users` SET `flow_token` = ? WHERE `user_id` = ?");
	$ins->bind_param("si",$_POST["token"],$_GET["uid"]);
	$ins->execute();

?>