// Função para adicionar créditos
document.getElementById('addCreditsBtn').addEventListener('click', async function(event) {
    event.preventDefault(); // Impede o envio padrão

    const amount = parseFloat(document.getElementById('betAmount').value);

    // Verifique se o valor é válido
    if (isNaN(amount) || amount <= 0) {
        document.getElementById('balanceMessage').textContent = "Por favor, insira um valor válido para os créditos.";
        document.getElementById('balanceMessage').style.display = 'block';
        console.error("Valor inválido para os créditos.");
        return;
    }

    // Enviar dados para a API
    try {
        console.log("Enviando dados para a API...");

        const response = await fetch('http://localhost:3000/addFunds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
               
            },
            body: JSON.stringify({ amount: amount })
        });

        console.log("Resposta recebida da API:", response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta da API:", errorText);
            throw new Error(errorText);
        }

        const data = await response.json();
        document.getElementById('balanceMessage').textContent = data.message;
        document.getElementById('balanceMessage').style.display = 'block';
        console.log("Créditos adicionados com sucesso:", data.message);

    } catch (error) {
        console.error("Erro ao adicionar créditos:", error);
        document.getElementById('balanceMessage').textContent = error.message;
        document.getElementById('balanceMessage').style.display = 'block';
    }
});

// Função para confirmar aposta
function confirmBet() {
    const eventTitle = document.getElementById('eventTitle').value;
    const betAmount = parseFloat(document.getElementById('betAmount').value);

    if (!eventTitle || isNaN(betAmount) || betAmount <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Realizar lógica da aposta aqui
    console.log("Aposta confirmada:", { eventTitle, betAmount });
}
