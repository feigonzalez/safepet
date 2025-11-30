<?php /*
	Esta es la pagina que se muestra cuando una persona sin la aplicación escanea
	el código QR de una mascota perdida. La lógica bajo la que trabaja esta página es
	la siguiente:
	
		1. Se obtiene la id de la mascota reportada desde $_GET["pet_id"];
		2. Se obtienen los datos de los dueños registrados a esa mascota
		3. Por cada dueño, si guardó si número de teléfono, se muestra en la pantalla
			3.1. También se puede mostrar un formulario para enviar un mensaje por WhatsApp
				 Habría que usar la api de WSP para ello
		4. Si ningún dueño ha ingresado su número de teléfono, se indica esto por la pantalla
			4.1. Se muestra un formulario para que este reportero pueda ingresar
				 sus propios datos.
			4.2. Al enviar el formulario, se genera un reporte y se le notifica a los dueños
				 usando los mecanismos de la aplicación misma.
			4.3. Se le indica al reportero las acciones tomadas y que "el dueño de la mascota
				 podrá ponerse en contacto con ellos".
			
*/ ?>

<?php
	
	include "sql.php";
	include "functions/pushNotification.php";
	$pageStatus="init";
	
	if(isset($_GET["petID"])){
		/* Buscar si la mascota existe */
		$pet_id = $_GET["petID"];
		$stmt = $sqlConn->prepare("SELECT * FROM `spet_pets` WHERE `pet_id` = ?");
		$stmt->bind_param("i",$_GET["petID"]);
		$stmt->execute();
		$res=$stmt->get_result();
        $petData = $res->fetch_array();
		if($petData == null){
			$pageStatus="noSuchPet";
		} else {
			// Buscar los dueños de la mascota 
			$stmt = $sqlConn->prepare("SELECT * FROM `spet_ownership` o LEFT JOIN `spet_users` u ON o.user_id = u.user_id WHERE `pet_id` = ?");
			$stmt->bind_param("i",$_GET["petID"]);
			$stmt->execute();
			$res=$stmt->get_result();
			
			$contacts=array();
			$owners=0;
			// Contar los dueños y guardar los teléfonos de quienes lo hayan registrado 
			while($row = $res->fetch_array()){
				$owners++;
				if(!empty($row["phone"])){
					$contacts[] = $row["phone"];
				}
			}
			if($owners==0){
				$pageStatus="noOwners";
			} else if (count($contacts)==0){
				$pageStatus="noContacts";
			} else {
				$pageStatus="readyToReport";
			}
		}
	} else if(isset($_POST["phone"]) && isset($_POST["pet_id"])){
		$pageStatus="reportMade";
		$stmt = $sqlConn->prepare("SELECT * FROM `spet_ownership` o LEFT JOIN `spet_users` u ON o.user_id = u.user_id WHERE `pet_id` = ?");
		$stmt->bind_param("i",$_POST["pet_id"]);
		$stmt->execute();
		$res=$stmt->get_result();
		while($row = $res->fetch_array()){
			pushNotification($row["user_id"], "Han hecho un reporte", "Un usuario ha encontrado a tu mascota, y te ha pedido que te comuniques con ellos con su número de teléfono, ".$_POST["phone"].".","warning");
		}
	}
	
?>

<head>
	<style>
		body{margin:0;background:linear-gradient(0deg,#822,#f44);padding:2em;font-size:5vw;
			font-family:Noto Sans JP, Arial, sans-serif}
		.mainContainer{height:100%;width:100%;background:#fff;box-sizing:border-box;
			border-radius:1em;padding:1em;display:flex;align-items:center;justify-content:center;
			text-align:center;flex-direction:column}
		.logoContainer img{width:8em;height:8em}
		.infoContainer{display:flex;flex-direction:column;height:100%;justify-content:center;align-items:center}
		.contactInfo{display:flex;padding:1em;box-shadow:0 2px 8px #0002;border-radius:3em;margin:0.5em}
		.iconWhatsapp{height:1.5em;width:1.5em;border-radius:50%;overflow:clip}
		.infoContainer a{text-decoration:none;color:#111;margin:0 1em}
		.title{font-weight:bold}
		input{width:100%;border:1px solid #444;border-radius:0.75em;
		padding:0.75em;font-size:1em;margin-bottom:1em;transition: border-color 0.2s ease, box-shadow 0.2s ease;}
		input[type=submit]{border:none;border-radius:2em;background:#f44;color:#fff;padding:1em}
		.meta{font-size:0.7em;position:relative;bottom:1.4em;color:#888}
	}
	</style>
	<script>
		window.addEventListener("load",()=>{
			let form = document.querySelector("form");
			if(form){
				form.addEventListener("submit",(ev)=>{
					let field = document.querySelector("input[type=tel]");
					if(!field.value.match(/\+?\d{9,11}/)){
						console.log("invalid");
						ev.preventDefault();
					} else {
						console.log("valid");
					}
				})
			}
		})
	</script>
<head>

<body>
	<div class="mainContainer">
		<div class="logoContainer">
			<img src="icon-only.png">
		</div>
		<div class="infoContainer">
			<?php
				switch($pageStatus){
					case "init":
						echo "<p>Cuando escanees el código QR de una mascota registrada en SafePet, podrás hacer un reporte de hallazgo.</p>";
						echo "<p>Se le avisará a los dueños y podrán ponerse en contacto para que pueran reecontrarse con su mascota.</p>";
						break;
					case "noSuchPet":
						echo "No se encontró la mascota que estás intentando reportar";
						break;
					case "noOwners":
						echo "Esta mascota no tiene dueños registrados";
						break;
					case "noContacts":
                        echo '<div class="title">¡Has encontrado a '.$petData["name"].'!</div>';
						if($owners>1){
                            echo "<p>Los dueños de esta mascota no han compartido sus datos de contacto</p>";
                            echo "<p>Puedes enviarles tu número de teléfono para que se pongan en contacto contigo.</p>";
                        } else {
                            echo "<p>El dueño de esta mascota no ha compartido sus datos de contacto</p>";
                            echo "<p>Puedes enviarle tu número de teléfono para que se ponga en contacto contigo.</p>";
                        }
                        echo '<form action="report.php" method="POST">';
                        echo '<input type="tel" name="phone" placeholder="Teléfono" required pattern="\+?\d{9,11}">';
						echo '<span class="meta">Ingresa un teléfono con el formato +56XXXXXXXXX</span>';
                        echo '<input type="hidden" name="pet_id" value="'.$petData["pet_id"].'">';
                        echo '<input type="submit" value="Enviar">';
                        echo '</form>';
						break;
					case "readyToReport":
                        echo '<div class="title">¡Has encontrado a '.$petData["name"].'!</div>';
                        echo '<p>Ahora puedes ponerte en contacto con '.(count($contacts)>1?'alguno de sus dueños':'su dueño').'.</p>';
						foreach($contacts as $contact){
							echo '<div class="contactInfo">';
							echo '<span class="iconWhatsapp"><svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" class="xrxyp3c xv0oops x1isl5vh xn8zj9a" fill="none"><title>wa-square-icon</title><rect width="40" height="40" rx="2" fill="#25D366" class="xl0owvu"></rect><path fill-rule="evenodd" clip-rule="evenodd" d="M7.16382 19.8867C7.16666 12.8126 12.9486 7.05882 20.0527 7.05882C23.4986 7.06024 26.7359 8.39611 29.1691 10.8205C31.6023 13.2448 32.9425 16.4695 32.9412 19.897C32.9383 26.9711 27.156 32.7255 20.0526 32.7255C17.9484 32.7248 15.8827 32.2146 14.0352 31.2426L7.58219 32.9272C7.27122 33.0084 6.989 32.7225 7.07425 32.4126L8.79752 26.1482C7.72503 24.2382 7.16292 22.0869 7.16382 19.8867ZM20.0463 30.4359H20.042C18.1611 30.4352 16.3163 29.9322 14.7069 28.9817L14.3241 28.7556L10.3569 29.7914L11.4158 25.9417L11.1666 25.547C10.1173 23.886 9.56313 21.9663 9.56399 19.9951C9.56629 14.2432 14.2686 9.5636 20.0505 9.5636C22.8502 9.56454 25.482 10.6511 27.4612 12.6231C29.4402 14.5949 30.5294 17.216 30.5283 20.0035C30.526 25.7559 25.8237 30.4359 20.0463 30.4359ZM23.5806 21.4974C23.8678 21.6029 25.4084 22.3667 25.7217 22.5247C25.7829 22.5556 25.84 22.5834 25.893 22.6092C26.1116 22.7156 26.2593 22.7875 26.3223 22.8935C26.4006 23.0252 26.4006 23.6574 26.1395 24.3951C25.8784 25.1326 24.6265 25.8058 24.0245 25.8964C23.4846 25.9777 22.8015 26.0116 22.0509 25.7713C21.5958 25.6258 21.0121 25.4315 20.2645 25.1061C17.3272 23.8281 15.3422 20.9596 14.9667 20.4169C14.9403 20.3789 14.9219 20.3522 14.9116 20.3384L14.9091 20.335C14.7433 20.1122 13.6321 18.6183 13.6321 17.0721C13.6321 15.6177 14.3411 14.8553 14.6675 14.5044C14.6898 14.4803 14.7104 14.4582 14.7288 14.4379C15.0161 14.1219 15.3556 14.0429 15.5645 14.0429C15.7733 14.0429 15.9824 14.0448 16.165 14.054C16.1875 14.0551 16.211 14.055 16.2352 14.0548C16.4178 14.0538 16.6455 14.0525 16.87 14.5959C16.9562 14.8047 17.0823 15.114 17.2153 15.4403C17.4852 16.1024 17.7836 16.8347 17.8361 16.9405C17.9145 17.0985 17.9667 17.2829 17.8622 17.4937C17.8466 17.5253 17.8321 17.5551 17.8182 17.5836C17.7398 17.745 17.6821 17.8637 17.5489 18.0204C17.4968 18.0818 17.4429 18.1479 17.389 18.2141C17.281 18.3466 17.1729 18.4792 17.0789 18.5736C16.922 18.731 16.7587 18.9019 16.9415 19.218C17.1243 19.5341 17.7532 20.5681 18.6846 21.4053C19.686 22.3054 20.5563 22.6858 20.9974 22.8786C21.0835 22.9162 21.1533 22.9467 21.2045 22.9725C21.5178 23.1307 21.7007 23.1042 21.8834 22.8935C22.0662 22.6828 22.6667 21.9715 22.8756 21.6554C23.0845 21.3395 23.2934 21.3921 23.5806 21.4974Z" fill="white" class=""></path></svg></span>';
							echo '<a href="https://wa.me/'.$contact.'">'.$contact.'</a></div>';
						}
						break;
					case "reportMade":
						echo '<div class="title">¡Gracias por tu reporte!</div>';
						echo "<p>Se le ha avisado al dueño para que se ponga en contacto contigo.</p>";
						echo "<p>Ya puedes cerrar esta ventana.</p>";
						break;
					default:
						echo "Hubo un error. [$pagestatus]";
						break;
				}
			?>
		</div>
	</div>
</body>