// URL específica del feed de tenencia responsable
const RSS_URL = 'https://tenenciaresponsablemascotas.cl/feed/';
var notifications;

async function beforeLoad(){
	if(!userData.account_id){
		document.querySelector("#all-notifications .card").remove()
	} else {
		// Solicita las notificaciones a la API
		request(SERVER_URL+"pullNotifications.php",{"account_id":userData.account_id}).then(n=>{
		notifications = n;
			if(notifications.status=="MISS"){
				document.querySelector("[foreach=notifications]").innerHTML="No tienes notificaciones nuevas";
			} else {
				// Fija el metaText de cada notificación a la timestamp de cuándo se generó la notificación.
				for(let n of notifications){
					try{n["metaText"]=getRecency(n.timestamp)}
					catch(e){n["metaText"]=n.timestamp}
				}
				fillIterable(document.querySelector("[foreach=notifications]"),notifications)
			}
		})
		loadNotifications();
	}
}


// Función para obtener noticias RSS del feed específico
async function fetchRSSNews() {
	console.log('🔄 Iniciando carga de noticias desde:', RSS_URL);
	
	try {
		// Usar rss2json para convertir RSS a JSON
		const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;
		console.log('📡 URL de conversión RSS2JSON:', rss2jsonUrl);
		
		const response = await fetch(rss2jsonUrl);
		console.log('📊 Respuesta del servidor:', response.status, response.statusText);
		
		if (!response.ok) {
			throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
		}
		
		const data = await response.json();
		console.log('📋 Datos recibidos:', data);
		
		if (data.status !== 'ok') {
			throw new Error(`Error en RSS2JSON: ${data.message || 'Error desconocido'}`);
		}
		
		if (!data.items || data.items.length === 0) {
			console.warn('⚠️ No se encontraron artículos en el feed');
			return [];
		}
		
		// Procesar los artículos del feed
		 const processedItems = data.items.slice(0, 10).map(item => {
			 // Obtener el contenido más completo disponible
			 let fullContent = item.content || item.description || '';
			 let description = item.description || '';
			 
			 // Si tenemos content y description, usar content como completo
			 if (item.content && item.description) {
				 fullContent = item.content;
				 description = item.description;
			 }
			 
			 // Limpiar HTML tags del contenido completo
			 fullContent = fullContent.replace(/<[^>]*>/g, ' ');
			 fullContent = fullContent.replace(/&[^;]+;/g, ' ');
			 fullContent = fullContent.replace(/\s+/g, ' ').trim();
			 
			 // Limpiar HTML tags de la descripción
			 description = description.replace(/<[^>]*>/g, ' ');
			 description = description.replace(/&[^;]+;/g, ' ');
			 description = description.replace(/\s+/g, ' ').trim();
			 
			 // Para la vista previa, limitar a 200 caracteres
			 let preview = description || fullContent;
			 if (preview.length > 200) {
				 let cutPoint = preview.lastIndexOf('.', 200);
				 if (cutPoint > 100) {
					 preview = preview.substring(0, cutPoint + 1);
				 } else {
					 cutPoint = preview.lastIndexOf(' ', 200);
					 preview = preview.substring(0, cutPoint) + '...';
				 }
			 }
			 
			 return {
				 title: item.title || 'Sin título',
				 description: preview || 'Sin descripción disponible',
				 fullContent: fullContent || description || 'Contenido no disponible',
				 link: item.link || '#',
				 meta: item.pubDate ? 
					 new Date(item.pubDate).toLocaleDateString('es-ES', {
						 year: 'numeric',
						 month: 'short',
						 day: 'numeric',
						 hour: '2-digit',
						 minute: '2-digit'
					 }) : 'Fecha no disponible',
				 pubDate: item.pubDate,
				 source: 'Tenencia Responsable Mascotas',
				 icon: 'pets'
			 };
		 });
		
		console.log('✅ Noticias procesadas exitosamente:', processedItems.length);
		return processedItems;
		
	} catch (error) {
		console.error('❌ Error al obtener noticias RSS:', error);
		console.log('⚠️ No se pudieron cargar las noticias');
		return [];
	}
}

// Función para abrir el enlace original
function openOriginalLink() {
	if (currentNewsItem && currentNewsItem.link) {
		window.open(currentNewsItem.link, '_blank');
	}
}

// Función principal para cargar noticias
async function loadNotifications() {
	const container = document.querySelector('[foreach=news]');
	
	try {
		const newsItems = await fetchRSSNews();
		
		if (newsItems.length > 0) {
			fillIterable(document.querySelector("[foreach=news]"),newsItems)
		} else {
			container.outerHTML = '<div class="card row compact error-message">No se pudieron cargar las noticias</div>';
		}
		
	} catch (error) {
		console.error('Error loading notifications:', error);
		container.outerHTML = '<div class="card row compact error-message">Error al cargar las noticias</div>';
	}
}