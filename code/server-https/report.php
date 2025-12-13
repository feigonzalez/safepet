<?php

	$response = curlGetRequest("http://dintdt.c1.biz/safepet/report.php?petID=".$_GET["petID"]);
	echo $response;

	function curlGetRequest($url){
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		return curl_exec($curl);
	}
	
?>