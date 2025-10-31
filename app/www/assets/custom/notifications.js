// Variables globales para el modal
let currentNewsItem = null;
let allNewsItems = [];

// URL específica del feed de tenencia responsable
const RSS_URL = 'https://tenenciaresponsablemascotas.cl/feed/';

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
                 icon: '🐕'
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

// Función para crear HTML de noticias con el mismo formato que las notificaciones estáticas
function createNewsHTML(items) {
    if (!items || items.length === 0) {
        return '<div class="no-content">No hay noticias disponibles</div>';
    }
    
    return items.map((item, index) => {
        // Formatear la fecha igual que las notificaciones estáticas (YYYY-MM-DD HH:MM:SS)
        let formattedDate = 'Fecha no disponible';
        if (item.pubDate) {
            const date = new Date(item.pubDate);
            formattedDate = date.getFullYear() + '-' + 
                          String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(date.getDate()).padStart(2, '0') + ' ' + 
                          String(date.getHours()).padStart(2, '0') + ':' + 
                          String(date.getMinutes()).padStart(2, '0') + ':' + 
                          String(date.getSeconds()).padStart(2, '0');
        }
        
        return `
            <div class="row compact card" onclick="window.open('${item.link}', '_blank')" style="cursor: pointer;">
                <div class="column notifItem ta-left">
                    <div class="row ta-left bold">
                        <span class="icon notifIcon" data-icon="pets"></span>
                        <span class="notifTitle">${item.title}</span>
                    </div>
                    <div class="column ta-left">
                        <div class="row ta-left metaText">${formattedDate}</div>
                        <div class="row ta-left">${item.description}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Función para abrir el modal con la noticia completa
function openNewsModal(index) {
    const item = allNewsItems[index];
    if (!item) return;
    
    currentNewsItem = item;
    
    // Llenar el modal con el contenido
    document.getElementById('modal-title').textContent = item.title;
    document.getElementById('modal-meta').innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <span style="font-size: 1.2em;">${item.icon}</span>
            <span style="color: #666; font-size: 0.9em;">${item.source}</span>
            <span style="color: #999; font-size: 0.8em;">•</span>
            <span style="color: #666; font-size: 0.9em;">Publicado: ${item.meta}</span>
        </div>
    `;
    
    // Mostrar el contenido completo disponible
    let content = item.fullContent || item.description;
    
    // Mejorar el formato del contenido
    if (content) {
        // Dividir en párrafos más inteligentemente
        let paragraphs = content.split(/\n\s*\n|\.\s+(?=[A-Z])/);
        
        // Filtrar párrafos vacíos y muy cortos
        paragraphs = paragraphs.filter(p => p.trim().length > 20);
        
        // Formatear cada párrafo
        const formattedContent = paragraphs.map(p => {
            let paragraph = p.trim();
            // Asegurar que termine con punto
            if (!paragraph.endsWith('.') && !paragraph.endsWith('!') && !paragraph.endsWith('?')) {
                paragraph += '.';
            }
            return `<p style="margin-bottom: 15px; line-height: 1.6; text-align: justify;">${paragraph}</p>`;
        }).join('');
        
        document.getElementById('modal-content').innerHTML = formattedContent;
    } else {
        document.getElementById('modal-content').innerHTML = '<p style="color: #666; font-style: italic;">Contenido no disponible.</p>';
    }
    
    // Actualizar el botón para mostrar "Ver fuente original"
    const originalButton = document.querySelector('#news-modal .original-link-btn');
    if (originalButton) {
        originalButton.innerHTML = '🔗 Ver fuente original';
        originalButton.onclick = openOriginalLink;
    }
    
    // Mostrar el modal
    document.getElementById('news-modal').style.display = 'flex';
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
function closeNewsModal() {
    document.getElementById('news-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentNewsItem = null;
}

// Función para abrir el enlace original
function openOriginalLink() {
    if (currentNewsItem && currentNewsItem.link) {
        window.open(currentNewsItem.link, '_blank');
    }
}

// Función principal para cargar noticias
async function loadNotifications() {
    const container = document.getElementById('noticias-feed');
    
    if (!container) {
        console.error('Contenedor de noticias no encontrado');
        return;
    }
    
    // Mostrar mensaje de carga
    container.innerHTML = '<div class="loading">Cargando noticias...</div>';
    
    try {
        // Obtener noticias RSS
        const newsItems = await fetchRSSNews();
        allNewsItems = newsItems; // Guardar para el modal
        
        if (newsItems.length > 0) {
            container.innerHTML = createNewsHTML(newsItems);
        } else {
            container.innerHTML = '<div class="error">No se pudieron cargar las noticias</div>';
        }
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = '<div class="error">Error al cargar las noticias</div>';
    }
}

// Cerrar modal al hacer click fuera de él
document.addEventListener('click', function(event) {
    const modal = document.getElementById('news-modal');
    if (event.target === modal) {
        closeNewsModal();
    }
});

// Cerrar modal con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeNewsModal();
    }
});

// Cargar noticias cuando se carga la página
document.addEventListener('DOMContentLoaded', loadNotifications);