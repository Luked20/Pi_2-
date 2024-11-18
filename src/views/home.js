
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = true; // Simula o estado de login (substitua com verificação real)
    const createEventButton = document.getElementById('createEventButton');
    const walletButton = document.getElementById('walletButton');
    const profileImage = document.getElementById('profileImage');

    if (isLoggedIn) {
        // Exibir botão "Criar Eventos" e "Minha Wallet"
        createEventButton.style.display = 'inline-block';
        walletButton.style.display = 'inline-block';

        // Configurar imagem de perfil
        profileImage.src = 'no-profile-picture-icon.webp'; // Substitua pelo link da imagem do usuário logado
        profileImage.style.display = 'inline-block';
    }
});

// Função para redirecionar para a página de criação de eventos
function goToCreateEvent() {
    window.location.href = 'createEvent.html';
}

function goToWallet() {
    window.location.href = 'wallet.html';
}

// Função para buscar eventos
async function searchEvents() {
    const query = document.getElementById('searchInput').value;

    if (query) {
        alert(`Buscando eventos com: ${query}`);

        try {
            const response = await fetch(`http://localhost:3000/searchEvents?keyword=${query}`);
            const events = await response.json();

            const resultsContainer = document.getElementById('searchResults');
            resultsContainer.innerHTML = ''; // Limpar os resultados anteriores

            if (events.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum evento encontrado.</p>';
            } else {
                events.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event');
                    eventElement.innerHTML = `
                        <div class="event-card">
                            <h3>${event.title}</h3>
                            <p>${event.description}</p>
                            <p><strong>Data:</strong> ${new Date(event.event_date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> ${event.status}</p>
                            <p><strong>Criado em:</strong> ${new Date(event.created_at).toLocaleDateString()}</p>
                            <p><strong>Atualizado em:</strong> ${new Date(event.updated_at).toLocaleDateString()}</p>
                        </div>
                    `;
                    resultsContainer.appendChild(eventElement);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            alert('Erro ao buscar eventos.');
        }
    } else {
        alert('Por favor, insira um termo de busca.');
    }
}


function showEventDetails(eventId) {
    // Lógica para exibir os detalhes do evento (overlay)
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div class="event-detail-card">
            <h2>Detalhes do Evento ${eventId}</h2>
            <p>Detalhes do evento com ID: ${eventId} serão carregados aqui...</p>
            <button onclick="closeEventDetails()">Fechar</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeEventDetails() {
    // Fechar o overlay
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.remove();
    }
}

