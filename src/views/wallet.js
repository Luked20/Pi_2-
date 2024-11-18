// Função para abrir o modal de adicionar créditos
function addCreditsModal() {
    document.getElementById('addCreditsModal').style.display = 'flex';
}

// Função para abrir o modal de sacar saldo
function withdrawModal() {
    document.getElementById('withdrawModal').style.display = 'flex';
}

// Função para fechar os modais
function closeModal() {
    document.getElementById('addCreditsModal').style.display = 'none';
    document.getElementById('withdrawModal').style.display = 'none';
}

// Função para confirmar a adição de créditos
async function confirmAddCredits() {
    const amount = document.getElementById('creditAmount').value;
    if (!amount || amount <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    // Fazer requisição para adicionar os fundos
    try {
        const response = await fetch('/api/addFunds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Pegue o token armazenado localmente
            },
            body: JSON.stringify({ amount })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Créditos adicionados com sucesso!');
            updateBalance();
            closeModal();
        } else {
            alert(result.message || 'Erro ao adicionar créditos.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao adicionar créditos.');
    }
}

// Função para confirmar o saque de saldo
async function confirmWithdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    const bankDetails = document.getElementById('bankDetails').value;
    if (!amount || amount <= 0 || !bankDetails) {
        alert('Por favor, insira um valor válido e detalhes bancários.');
        return;
    }

    // Fazer requisição para sacar os fundos
    try {
        const response = await fetch('/api/withdrawFunds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Pegue o token armazenado localmente
            },
            body: JSON.stringify({ amount, bankDetails })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Saque realizado com sucesso!');
            updateBalance();
            closeModal();
        } else {
            alert(result.message || 'Erro ao sacar saldo.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao sacar saldo.');
    }
}

// Função para atualizar o saldo na interface
async function updateBalance() {
    try {
        const response = await fetch('/api/getBalance', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Pegue o token armazenado localmente
            }
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById('currentBalance').innerText = `R$ ${result.balance.toFixed(2)}`;
        } else {
            alert(result.message || 'Erro ao obter o saldo.');
        }
    } catch (error) {
        console.error('Erro ao atualizar o saldo:', error);
        alert('Erro ao obter o saldo.');
    }
}

// Atualizar o saldo na página ao carregar
document.addEventListener('DOMContentLoaded', () => {
    updateBalance();
});
