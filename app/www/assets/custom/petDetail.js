
        async function beforeLoad(){
            const petId = URLparams.id;
            
            if(!petId){
                window.location.href = 'petList.html';
                return;
            }
            
            const pets = await selectAllFrom('pets');
            const pet = pets[petId];
            
            if(!pet){
                window.location.href = 'petList.html';
                return;
            }
            
            // Actualizar título
            document.querySelector('h1').textContent = `Detalles de ${pet.name}`;
            
            // Actualizar imagen
            const petImage = document.querySelector('#petImageDisplay');
            if(pet.images && pet.images[0]){
                petImage.style.backgroundImage = `url(media/${pet.images[0]})`;
            }
            
            // Actualizar información básica
            const sexSymbol = pet.sex?.toLowerCase().startsWith('h') ? '♀️' : '♂️';
            document.querySelector('#petName').textContent = `${pet.name} ${sexSymbol}`;
            document.querySelector('#petSummary').textContent = `${pet.species} (${pet.breed})`;
            
            // Actualizar detalles
            document.querySelector('#detailSpecies').textContent = pet.species || 'No especificado';
            document.querySelector('#detailBreed').textContent = pet.breed || 'No especificado';
            document.querySelector('#detailColor').textContent = pet.color || 'No especificado';
            document.querySelector('#detailSex').textContent = pet.sex || 'No especificado';
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