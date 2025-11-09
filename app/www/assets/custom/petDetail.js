const petDetailMenu = {
	"Editar Datos":()=>{console.log("editar datos")},
	"Añadir Dueño":()=>{console.log("añadir dueño")},
	"Eliminar Mascota":()=>{console.log("eliminar mascota")}
}
        async function beforeLoad(){
			petData = await request(SERVER_URL+"getPet.php",{account_id:userData.account_id,pet_id:URLparams.id})
			
			/*
            // Actualizar imagen
            const petImage = document.querySelector('#petImageDisplay');
            if(pet.images && pet.images[0]){
                petImage.style.backgroundImage = `url(media/${pet.images[0]})`;
            }
            */
			
            // Actualizar información básica
            const sexSymbol = petData.sex?.toLowerCase().startsWith('h') ? '♀️' : '♂️';
            document.querySelector('#petName').textContent = `${petData.name} ${sexSymbol}`;
            
            // Actualizar detalles
            document.querySelector('#detailSpecies').textContent = petData.species || 'No especificado';
            document.querySelector('#detailBreed').textContent = petData.breed || 'No especificado';
            document.querySelector('#detailColor').textContent = petData.color || 'No especificado';
        }
        
        async function reportLoss() {
            const petId = URLparams.id;
            
            if(!petId) {
                alert('Error: No se pudo identificar la mascota');
                return;
            }
            
            const confirmed = await showVerificationModal(
                'Reportar Pérdida',
                '¿Estás seguro de que quieres reportar la pérdida de esta mascota? Se notificará a la comunidad y autoridades locales.',
                'Reportar Pérdida',
                'Cancelar'
            );
            
            if (confirmed) {
                // Simular el reporte de pérdida
                ValidationUtils.showSuccessMessage('Reporte de pérdida enviado exitosamente. Se ha notificado a la comunidad y autoridades locales.');
                
                // Opcional: redirigir al historial de reportes
                setTimeout(() => {
                    window.location.href = 'reportHistory.html';
                }, 2000);
            }
        }