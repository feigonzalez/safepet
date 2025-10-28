
		let currentFilter = 'all';
		
		function filterReports(status) {
			currentFilter = status;
			
			// Actualizar tabs activos
			document.querySelectorAll('.filterTab').forEach(tab => {
				tab.classList.remove('active');
			});
			event.target.classList.add('active');
			
			// Filtrar reportes
			const reports = document.querySelectorAll('.reportCard');
			let visibleCount = 0;
			
			reports.forEach(report => {
				const reportStatus = report.dataset.status;
				if (status === 'all' || reportStatus === status) {
					report.style.display = 'block';
					visibleCount++;
				} else {
					report.style.display = 'none';
				}
			});
			
			// Mostrar estado vacío si no hay reportes visibles
			document.getElementById('emptyState').style.display = visibleCount === 0 ? 'block' : 'none';
		}
		
		function searchReports(query) {
			const reports = document.querySelectorAll('.reportCard');
			let visibleCount = 0;
			
			reports.forEach(report => {
				const petName = report.dataset.pet.toLowerCase();
				const matchesSearch = petName.includes(query.toLowerCase());
				const matchesFilter = currentFilter === 'all' || report.dataset.status === currentFilter;
				
				if (matchesSearch && matchesFilter) {
					report.style.display = 'block';
					visibleCount++;
				} else {
					report.style.display = 'none';
				}
			});
			
			document.getElementById('emptyState').style.display = visibleCount === 0 ? 'block' : 'none';
		}
		
		function viewReport(petId) {
			window.location.href = `alertDetail.html?pet=${petId}`;
		}
		
		function editReport(petId) {
			alert(`Editar reporte de ${petId}`);
		}
		
		async function markAsFound(petId) {
			const confirmed = await showVerificationModal(
				'Marcar como Encontrada',
				`¿Confirmas que ${petId} ha sido encontrada?`,
				'Confirmar',
				'Cancelar'
			);
			
			if (confirmed) {
				ValidationUtils.showSuccessMessage(`${petId} ha sido marcada como encontrada`);
				// Aquí se actualizaría el estado del reporte
			}
		}
		
		function thankRescuer(petId) {
			ValidationUtils.showSuccessMessage(`Mensaje de agradecimiento enviado por encontrar a ${petId}`);
		}
		
		async function closeReport(petId) {
			const confirmed = await showVerificationModal(
				'Cerrar Reporte',
				`¿Estás seguro de que quieres cerrar el reporte de ${petId}?`,
				'Cerrar Reporte',
				'Cancelar'
			);
			
			if (confirmed) {
				ValidationUtils.showSuccessMessage(`Reporte de ${petId} cerrado exitosamente`);
			}
		}
		
		async function duplicateReport(petId) {
			const confirmed = await showVerificationModal(
				'Duplicar Reporte',
				`¿Quieres crear un nuevo reporte basado en ${petId}?`,
				'Crear Reporte',
				'Cancelar'
			);
			
			if (confirmed) {
				ValidationUtils.showSuccessMessage(`Nuevo reporte creado basado en ${petId}`);
			}
		}