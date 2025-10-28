
        let currentChatId = '';
        let currentContactName = '';
        let messages = [];
        
        // Datos de ejemplo para diferentes chats
        const chatData = {
            'dueno-dargon': {
                name: 'Dueño de Dargón',
                avatar: 'media/dargon.jpg',
                status: 'En línea',
                messages: [
                    {
                        id: 1,
                        text: 'Hola, vi a tu mascota cerca del parque central',
                        sent: false,
                        time: '14:30',
                        status: 'read'
                    },
                    {
                        id: 2,
                        text: '¿Podrías darme más detalles sobre dónde exactamente?',
                        sent: true,
                        time: '14:32',
                        status: 'read'
                    },
                    {
                        id: 3,
                        text: 'Estaba cerca de la fuente, jugando con otros perros',
                        sent: false,
                        time: '14:35',
                        status: 'read'
                    }
                ]
            },
            'dueno-covellina': {
                name: 'Dueño de Covellina',
                avatar: 'media/covellina.jpg',
                status: 'Visto hace 2 min',
                messages: [
                    {
                        id: 1,
                        text: '¿Sigues buscando? Puedo ayudarte en la zona norte',
                        sent: false,
                        time: '14:25',
                        status: 'read'
                    },
                    {
                        id: 2,
                        text: 'Sí, por favor. Cualquier ayuda es bienvenida',
                        sent: true,
                        time: '14:26',
                        status: 'delivered'
                    }
                ]
            },
            'veterinaria-san-martin': {
                name: 'Veterinaria San Martín',
                avatar: 'media/florencia.jpg',
                status: 'En línea',
                messages: [
                    {
                        id: 1,
                        text: 'Tenemos información sobre tu mascota, por favor contactanos',
                        sent: false,
                        time: '14:15',
                        status: 'read'
                    },
                    {
                        id: 2,
                        text: '¡Perfecto! ¿Qué información tienen?',
                        sent: true,
                        time: '14:16',
                        status: 'read'
                    },
                    {
                        id: 3,
                        text: 'Un cliente trajo una mascota que coincide con tu descripción. ¿Puedes venir a verificar?',
                        sent: false,
                        time: '14:18',
                        status: 'read'
                    }
                ]
            },
            'refugio-municipal': {
                name: 'Refugio Municipal',
                avatar: 'media/dargon.jpg',
                status: 'Visto hace 30 min',
                messages: [
                    {
                        id: 1,
                        text: 'Hemos recibido tu reporte. Mantendremos los ojos abiertos',
                        sent: false,
                        time: '13:30',
                        status: 'read'
                    },
                    {
                        id: 2,
                        text: 'Muchas gracias por su ayuda',
                        sent: true,
                        time: '13:32',
                        status: 'read'
                    }
                ]
            }
        };
        
        // Inicializar chat
        function initializeChat() {
            const params = getUrlParams();
            currentChatId = params.chatId || 'dueno-dargon';
            currentContactName = params.contactName || 'Contacto';
            
            const chatInfo = chatData[currentChatId];
            if (chatInfo) {
                document.getElementById('contactName').textContent = chatInfo.name;
                document.getElementById('contactStatus').textContent = chatInfo.status;
                document.getElementById('contactAvatar').style.backgroundImage = `url('${chatInfo.avatar}')`;
                messages = [...chatInfo.messages];
                renderMessages();
            }
        }
        
        // Renderizar mensajes
        function renderMessages() {
            const messagesArea = document.getElementById('messagesArea');
            const dateHeader = messagesArea.querySelector('.dateHeader');
            
            // Limpiar mensajes anteriores pero mantener el header de fecha
            const existingMessages = messagesArea.querySelectorAll('.message');
            existingMessages.forEach(msg => msg.remove());
            
            messages.forEach(message => {
                const messageElement = createMessageElement(message);
                messagesArea.appendChild(messageElement);
            });
            
            // Scroll al final
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
        
        // Crear elemento de mensaje
        function createMessageElement(message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sent ? 'sent' : 'received'}`;
            
            let statusHtml = '';
            if (message.sent) {
                let statusIcon = '';
                switch (message.status) {
                    case 'sent':
                        statusIcon = '✓';
                        break;
                    case 'delivered':
                        statusIcon = '✓✓';
                        break;
                    case 'read':
                        statusIcon = '✓✓';
                        break;
                }
                statusHtml = `<div class="messageStatus">${statusIcon}</div>`;
            }
            
            messageDiv.innerHTML = `
                <div>${message.text}</div>
                <div class="messageTime">${message.time}</div>
                ${statusHtml}
            `;
            
            return messageDiv;
        }
        
        // Enviar mensaje
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            
            if (text) {
                const newMessage = {
                    id: messages.length + 1,
                    text: text,
                    sent: true,
                    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    status: 'sent'
                };
                
                messages.push(newMessage);
                renderMessages();
                input.value = '';
                updateSendButton();
                
                // Simular respuesta automática después de un delay
                setTimeout(() => {
                    simulateTyping();
                }, 1000);
            }
        }
        
        // Simular indicador de escritura
        function simulateTyping() {
            const typingIndicator = document.getElementById('typingIndicator');
            const typingText = document.getElementById('typingText');
            
            typingText.textContent = `${currentContactName} está escribiendo...`;
            typingIndicator.style.display = 'block';
            
            setTimeout(() => {
                typingIndicator.style.display = 'none';
                
                // Simular respuesta
                const responses = [
                    'Gracias por la información',
                    'Entendido, estaré atento',
                    'Te mantendré informado',
                    'Perfecto, nos vemos pronto'
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const responseMessage = {
                    id: messages.length + 1,
                    text: randomResponse,
                    sent: false,
                    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    status: 'read'
                };
                
                messages.push(responseMessage);
                renderMessages();
            }, 2000);
        }
        
        // Actualizar estado del botón enviar
        function updateSendButton() {
            const input = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            sendButton.disabled = !input.value.trim();
        }
        
        // Auto-resize del textarea
        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
        }
        
        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            initializeChat();
            
            const backButton = document.getElementById('backButton');
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            
            // Botón de retroceso
            backButton.addEventListener('click', function() {
                goBack();
            });
            
            // Input de mensaje
            messageInput.addEventListener('input', function() {
                updateSendButton();
                autoResize(this);
            });
            
            messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!sendButton.disabled) {
                        sendMessage();
                    }
                }
            });
            
            // Botón enviar
            sendButton.addEventListener('click', sendMessage);
        });