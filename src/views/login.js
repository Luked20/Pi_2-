document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviar dados para a API
    try {
        const response = await fetch('http://localhost:3000/login', { // Verifique a porta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Log da resposta
        console.log("Resposta recebida da API:", response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta da API:", errorText);
            document.getElementById('message').textContent = errorText; // Mensagem de erro
            return;
        }

        const data = await response.json();
        document.getElementById('message').textContent = data.message; // Mensagem de sucesso
        console.log("Login bem-sucedido:", data.message);

        // Redirecionar para a página inicial após o login bem-sucedido
        window.location.href = 'home.html'; // Substitua pelo caminho correto da sua página inicial

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        document.getElementById('message').textContent = "Erro ao fazer login. Tente novamente."; // Mensagem de erro
    }
});
